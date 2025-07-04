import _ from "lodash";

/**
 * Java의 Builder 패턴과 유사한 Fluent Interface를 제공하는 쿼리 빌더 클래스입니다.
 * AND, OR 조건을 순서대로 조합하고, 중첩된 괄호(그룹)를 표현할 수 있습니다.
 */
class QueryBuilder {
  /**
   * @private
   * 쿼리의 각 부분을 저장하는 배열입니다.
   * 각 요소는 { type, ... } 형태의 객체입니다.
   * e.g., { type: 'condition', field, op, value }
   * e.g., { type: 'connector', value: 'AND' }
   * e.g., { type: 'group', builder: QueryBuilder_instance }
   */
  #parts = [];
  #defaultOption = {};
  #parameters = {};
  /**
   * 빌더 인스턴스를 생성하는 정적 팩토리 메서드입니다.
   * @returns {QueryBuilder} 새로운 QueryBuilder 인스턴스
   */
  static create(props = { defaultOption: {}, parameters: {} }) {
    return new QueryBuilder(props);
  }
  constructor(props) {
    this.#defaultOption = _.merge(
      this.#defaultOption || {},
      props?.defaultOption || {}
    );
    this.#parameters = _.merge(this.#parameters || {}, props?.parameters || {});
  }
  /**
   * @private
   * 값을 SQL에 맞게 포매팅합니다. 문자열은 작은따옴표로 감싸줍니다.
   * 실제 애플리케이션에서는 SQL Injection을 방지하기 위해 Prepared Statements를 사용해야 합니다.
   * @param {*} value - 포매팅할 값
   * @returns {string|number} 포매팅된 값
   */
  #formatValue(value, option = {}) {
    if (typeof value === "string") {
      if (option?.prefix) value = option.prefix + value;
      if (option?.suffix) value = value + option.suffix;
    }
    return value;
  }

  /**
   * @private
   * 조건(condition)을 내부 배열에 추가하는 헬퍼 메서드입니다.
   * @param {string|null} connector - 'AND' 또는 'OR', 첫 조건일 경우 null
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @param {boolean} negated
   */
  #addCondition(
    connector,
    value,
    parameters = {},
    option = {},
    negated = false
  ) {
    if (this.#parts.length > 0 && connector) {
      this.#parts.push({ type: "connector", value: connector });
    }
    if (!option?.disabled) {
      this.#parts.push({
        type: "condition",
        value,
        option,
        negated,
      });
      this.#parameters = _.merge(this.#parameters || {}, parameters || {});
    }
  }

  /**
   * @private
   * 그룹(괄호)을 내부 배열에 추가하는 헬퍼 메서드입니다.
   * @param {string|null} connector - 'AND' 또는 'OR'
   * @param {function(QueryBuilder): void} callback - 하위 쿼리를 구성할 콜백 함수
   * @param {boolean} negated
   */
  #addGroup(connector, callback, negated = false) {
    if (this.#parts.length > 0 && connector) {
      this.#parts.push({ type: "connector", value: connector });
    }
    const groupBuilder = new QueryBuilder({
      defaultOption: this.#defaultOption,
    });
    callback(groupBuilder);

    // 그룹 내에 조건이 있을 경우에만 추가
    if (groupBuilder.#parts.length > 0) {
      this.#parts.push({ type: "group", builder: groupBuilder, negated });
    }
  }
  option(option, descendants = true) {
    this.#defaultOption = _.merge(this.#defaultOption || {}, option || {});
    if (descendants) {
      this.#parts = this.#parts.map((part) => {
        if (part.type === "group") {
          part.builder.option(this.#defaultOption, true);
        }
        return part;
      });
    }
  }
  /**
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  where(value, parameters, option) {
    this.#addCondition(null, value, parameters, option);
    return this;
  }
  /**
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  notWhere(value, parameters, option) {
    this.#addCondition(null, value, parameters, option, true);
  }
  /**
   * AND 연산자와 함께 쿼리 조건을 추가합니다.
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @returns {QueryBuilder}
   */
  andWhere(value, parameters, option) {
    this.#addCondition("AND", value, parameters, option);
    return this;
  }
  /**
   * AND 연산자와 함께 쿼리 조건을 추가합니다.
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @returns {QueryBuilder}
   */
  andNotWhere(value, parameters, option) {
    this.#addCondition("AND", value, parameters, option, true);
    return this;
  }

  /**
   * OR 연산자와 함께 쿼리 조건을 추가합니다.
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @returns {QueryBuilder}
   */
  orWhere(value, parameters, option) {
    this.#addCondition("OR", value, parameters, option);
    return this;
  }
  /**
   * OR 연산자와 함께 쿼리 조건을 추가합니다.
   * @param {string} value - 대상
   * @param {*} option - 옵션
   * @param {*} parameters - 변수
   * @returns {QueryBuilder}
   */
  orNotWhere(value, parameters, option) {
    this.#addCondition("OR", value, parameters, option, true);
    return this;
  }

  /**
   * AND 연산자와 함께 그룹(괄호) 조건을 추가합니다.
   * @param {function(QueryBuilder): void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder}
   */
  andGroup(callback) {
    this.#addGroup("AND", callback);
    return this;
  }

  /**
   * AND 연산자와 함께 그룹(괄호) 조건을 추가합니다.
   * @param {function(QueryBuilder): void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder}
   */
  andNotGroup(callback) {
    this.#addGroup("AND", callback, true);
    return this;
  }

  /**
   * OR 연산자와 함께 그룹(괄호) 조건을 추가합니다.
   * @param {function(QueryBuilder): void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder}
   */
  orGroup(callback) {
    this.#addGroup("OR", callback);
    return this;
  }
  /**
   * OR 연산자와 함께 그룹(괄호) 조건을 추가합니다.
   * @param {function(QueryBuilder): void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder}
   */
  orNotGroup(callback) {
    this.#addGroup("OR", callback, true);
    return this;
  }

  /**
   * 지금까지 구성된 모든 조건을 바탕으로 최종 쿼리 문자열을 생성합니다.
   * @returns {string} 완성된 쿼리 조건 문자열
   */
  build() {
    let queryParts = [];
    for (const part of this.#parts) {
      switch (part.type) {
        case "condition":
          // queryParts.push(part.value);
          let query = this.#formatValue(
            part.value,
            _.merge(this.#defaultOption || {}, part.option || {})
          );
          if (part.negated)
            query = `${
              this.#defaultOption?.NOT || this.#defaultOption?.not || "NOT"
            } (${query})`;
          queryParts.push(query);
          break;
        case "connector":
          switch (part.value) {
            case "AND":
              queryParts.push(
                this.#defaultOption?.AND || this.#defaultOption?.and || "AND"
              );
              break;
            case "OR":
              queryParts.push(
                this.#defaultOption?.OR || this.#defaultOption?.or || "OR"
              );
              break;
            default:
              queryParts.push(part.value);
              break;
          }
          break;
        case "group":
          // 재귀적으로 하위 빌더의 build()를 호출하고 괄호로 감쌉니다.
          const groupQuery = part.builder.build();
          if (groupQuery) {
            let query = `(${groupQuery})`;
            if (part.negated) {
              query = `${
                this.#defaultOption?.NOT || this.#defaultOption?.not || "NOT"
              } ${query}`;
            }
            queryParts.push(query);
          }
          break;
        default:
          break;
      }
    }
    // 각 부분을 공백으로 연결하여 최종 문자열을 만듭니다.
    const result = queryParts.join(" ");

    const regex = /:(\w+)/g;
    return result.replace(regex, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(this.#parameters, key)) {
        const result = this.#parameters[key];
        if (typeof result === "string") return `'${result}'`;
        else if (
          typeof result === "number" ||
          typeof result === "boolean" ||
          typeof result === "bigint"
        )
          return result;
        else if (typeof result === "object") return "[Object]";
        else return "Unknown";
      }
      return match;
    });
  }
  clone() {
    const clone = QueryBuilder.create();
    clone.#parts = [...this.#parts];
    clone.#parameters = { ...this.#parameters };
    clone.#defaultOption = { ...this.#defaultOption };
    return clone;
  }
}
export default QueryBuilder;
