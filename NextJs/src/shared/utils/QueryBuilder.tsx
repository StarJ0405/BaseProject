// utils/QueryBuilder.ts

import _ from "lodash";

// 쿼리 파트의 타입을 정의하는 인터페이스
interface QueryPart {
  type: "condition" | "connector" | "group";
  value?: string; // connector 또는 condition의 값
  option?: QueryOption;
  parameters?: Record<string, any>;
  negated?: boolean;
  builder?: QueryBuilder; // group 타입일 경우 하위 QueryBuilder 인스턴스
}

// 조건 옵션의 타입을 정의하는 인터페이스
interface QueryOption {
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  NOT?: string; // NOT 키워드 커스터마이징
  not?: string;
  AND?: string; // AND 키워드 커스터마이징
  and?: string;
  OR?: string; // OR 키워드 커스터마이징
  or?: string;
  [key: string]: any; // 기타 동적 속성 허용
}

// QueryBuilder 생성자 props의 타입을 정의하는 인터페이스
interface QueryBuilderProps {
  defaultOption?: QueryOption;
  parameters?: Record<string, any>;
}

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
  #parts: QueryPart[] = [];
  #defaultOption: QueryOption = {};
  #parameters: Record<string, any> = {};

  /**
   * 빌더 인스턴스를 생성하는 정적 팩토리 메서드입니다.
   * @param {QueryBuilderProps} props - 초기 옵션 및 매개변수
   * @returns {QueryBuilder} 새로운 QueryBuilder 인스턴스
   */
  static create(props: QueryBuilderProps = {}): QueryBuilder {
    return new QueryBuilder(props);
  }

  constructor(props: QueryBuilderProps = {}) {
    this.#defaultOption = _.merge(
      this.#defaultOption, // 초기값 또는 이전 병합된 값
      props.defaultOption || {}
    );
    this.#parameters = _.merge(this.#parameters, props.parameters || {});
  }

  /**
   * @private
   * 값을 SQL에 맞게 포매팅합니다. 문자열은 작은따옴표로 감싸줍니다.
   * 실제 애플리케이션에서는 SQL Injection을 방지하기 위해 Prepared Statements를 사용해야 합니다.
   * @param {*} value - 포매팅할 값
   * @param {QueryOption} option - 포매팅 옵션
   * @returns {string | number | boolean | bigint} 포매팅된 값
   */
  #formatValue(
    value: any,
    option: QueryOption = {}
  ): string | number | boolean | bigint {
    if (typeof value === "string") {
      let formattedValue = value;
      if (option?.prefix) formattedValue = option.prefix + formattedValue;
      if (option?.suffix) formattedValue = formattedValue + option.suffix;
      return formattedValue;
    }
    return value;
  }

  /**
   * @private
   * 조건(condition)을 내부 배열에 추가하는 헬퍼 메서드입니다.
   * @param {string | null} connector - 'AND' 또는 'OR', 첫 조건일 경우 null
   * @param {string} value - 대상 조건 문자열 (예: "field = :param")
   * @param {Record<string, any>} parameters - 조건에 사용될 변수 객체
   * @param {QueryOption} option - 조건에 대한 옵션
   * @param {boolean} negated - 조건이 부정(NOT)인지 여부
   */
  #addCondition(
    connector: string | null,
    value: string,
    parameters: Record<string, any> = {},
    option: QueryOption = {},
    negated: boolean = false
  ): void {
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
      this.#parameters = _.merge(this.#parameters, parameters);
    }
  }

  /**
   * @private
   * 그룹(괄호)을 내부 배열에 추가하는 헬퍼 메서드입니다.
   * @param {string | null} connector - 'AND' 또는 'OR'
   * @param {(builder: QueryBuilder) => void} callback - 하위 쿼리를 구성할 콜백 함수
   * @param {boolean} negated - 그룹이 부정(NOT)인지 여부
   */
  #addGroup(
    connector: string | null,
    callback: (builder: QueryBuilder) => void,
    negated: boolean = false
  ): void {
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

  /**
   * 현재 빌더의 기본 옵션을 설정합니다.
   * @param {QueryOption} option - 적용할 옵션
   * @param {boolean} descendants - 하위 그룹 빌더에도 옵션을 적용할지 여부
   * @returns {void}
   */
  option(option: QueryOption, descendants: boolean = true): void {
    this.#defaultOption = _.merge(this.#defaultOption, option);
    if (descendants) {
      this.#parts = this.#parts.map((part) => {
        if (part.type === "group" && part.builder) {
          part.builder.option(this.#defaultOption, true);
        }
        return part;
      });
    }
  }

  /**
   * 쿼리 조건을 추가합니다. 첫 조건으로 사용됩니다.
   * @param {string} value - 대상 조건 문자열
   * @param {Record<string, any>} [parameters] - 조건에 사용될 변수 객체
   * @param {QueryOption} [option] - 조건에 대한 옵션
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  where(
    value: string,
    parameters?: Record<string, any>,
    option?: QueryOption
  ): QueryBuilder {
    this.#addCondition(null, value, parameters, option);
    return this;
  }

  /**
   * 부정(NOT) 쿼리 조건을 추가합니다. 첫 조건으로 사용됩니다.
   * @param {string} value - 대상 조건 문자열
   * @param {Record<string, any>} [parameters] - 조건에 사용될 변수 객체
   * @param {QueryOption} [option] - 조건에 대한 옵션
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  notWhere(
    value: string,
    parameters?: Record<string, any>,
    option?: QueryOption
  ): QueryBuilder {
    this.#addCondition(null, value, parameters, option, true);
    return this;
  }

  /**
   * AND 연산자와 함께 쿼리 조건을 추가합니다.
   * @param {string} value - 대상 조건 문자열
   * @param {Record<string, any>} [parameters] - 조건에 사용될 변수 객체
   * @param {QueryOption} [option] - 조건에 대한 옵션
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  andWhere(
    value: string,
    parameters?: Record<string, any>,
    option?: QueryOption
  ): QueryBuilder {
    this.#addCondition("AND", value, parameters, option);
    return this;
  }

  /**
   * AND 연산자와 함께 부정(NOT) 쿼리 조건을 추가합니다.
   * @param {string} value - 대상 조건 문자열
   * @param {Record<string, any>} [parameters] - 조건에 사용될 변수 객체
   * @param {QueryOption} [option] - 조건에 대한 옵션
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  andNotWhere(
    value: string,
    parameters?: Record<string, any>,
    option?: QueryOption
  ): QueryBuilder {
    this.#addCondition("AND", value, parameters, option, true);
    return this;
  }

  /**
   * OR 연산자와 함께 쿼리 조건을 추가합니다.
   * @param {string} value - 대상 조건 문자열
   * @param {Record<string, any>} [parameters] - 조건에 사용될 변수 객체
   * @param {QueryOption} [option] - 조건에 대한 옵션
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  orWhere(
    value: string,
    parameters?: Record<string, any>,
    option?: QueryOption
  ): QueryBuilder {
    this.#addCondition("OR", value, parameters, option);
    return this;
  }

  /**
   * OR 연산자와 함께 부정(NOT) 쿼리 조건을 추가합니다.
   * @param {string} value - 대상 조건 문자열
   * @param {Record<string, any>} [parameters] - 조건에 사용될 변수 객체
   * @param {QueryOption} [option] - 조건에 대한 옵션
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  orNotWhere(
    value: string,
    parameters?: Record<string, any>,
    option?: QueryOption
  ): QueryBuilder {
    this.#addCondition("OR", value, parameters, option, true);
    return this;
  }

  /**
   * AND 연산자와 함께 그룹(괄호) 조건을 추가합니다.
   * @param {(builder: QueryBuilder) => void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  andGroup(callback: (builder: QueryBuilder) => void): QueryBuilder {
    this.#addGroup("AND", callback);
    return this;
  }

  /**
   * AND 연산자와 함께 부정(NOT) 그룹(괄호) 조건을 추가합니다.
   * @param {(builder: QueryBuilder) => void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  andNotGroup(callback: (builder: QueryBuilder) => void): QueryBuilder {
    this.#addGroup("AND", callback, true);
    return this;
  }

  /**
   * OR 연산자와 함께 그룹(괄호) 조건을 추가합니다.
   * @param {(builder: QueryBuilder) => void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  orGroup(callback: (builder: QueryBuilder) => void): QueryBuilder {
    this.#addGroup("OR", callback);
    return this;
  }

  /**
   * OR 연산자와 함께 부정(NOT) 그룹(괄호) 조건을 추가합니다.
   * @param {(builder: QueryBuilder) => void} callback - 하위 쿼리를 구성할 콜백
   * @returns {QueryBuilder} 메서드 체이닝을 위한 현재 인스턴스
   */
  orNotGroup(callback: (builder: QueryBuilder) => void): QueryBuilder {
    this.#addGroup("OR", callback, true);
    return this;
  }

  /**
   * 지금까지 구성된 모든 조건을 바탕으로 최종 쿼리 문자열을 생성합니다.
   * @returns {string} 완성된 쿼리 조건 문자열
   */
  build(): string {
    let queryParts: string[] = [];
    for (const part of this.#parts) {
      switch (part.type) {
        case "condition":
          let query = this.#formatValue(
            part.value,
            _.merge({}, this.#defaultOption, part.option)
          );
          if (part.negated) {
            query = `${
              this.#defaultOption?.NOT || this.#defaultOption?.not || "NOT"
            } (${query})`;
          }
          queryParts.push(String(query)); // formatValue의 반환 타입이 다양하므로 string으로 변환
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
              queryParts.push(part.value || "");
              break;
          }
          break;
        case "group":
          // 재귀적으로 하위 빌더의 build()를 호출하고 괄호로 감쌉니다.
          if (part.builder) {
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
          }
          break;
        default:
          break;
      }
    }
    // 각 부분을 공백으로 연결하여 최종 문자열을 만듭니다.
    const result = queryParts.join(" ");

    // 파라미터 치환
    const regex = /:(\w+)/g;
    return result.replace(regex, (match, key) => {
      if (Object.prototype.hasOwnProperty.call(this.#parameters, key)) {
        const paramValue = this.#parameters[key];
        if (typeof paramValue === "string") return `'${paramValue}'`;
        else if (
          typeof paramValue === "number" ||
          typeof paramValue === "boolean" ||
          typeof paramValue === "bigint"
        )
          return String(paramValue); // 숫자, boolean, bigint는 그대로 문자열로
        else if (typeof paramValue === "object" && paramValue !== null)
          return JSON.stringify(paramValue); // 객체는 JSON 문자열로
        else return "NULL"; // null 또는 undefined 처리
      }
      return match; // 매칭되는 파라미터가 없으면 원래 문자열 반환
    });
  }

  /**
   * 현재 QueryBuilder 인스턴스를 복제합니다.
   * @returns {QueryBuilder} 복제된 QueryBuilder 인스턴스
   */
  clone(): QueryBuilder {
    const clone = QueryBuilder.create();
    clone.#parts = [...this.#parts]; // 배열 복사
    clone.#parameters = { ...this.#parameters }; // 객체 복사
    clone.#defaultOption = { ...this.#defaultOption }; // 객체 복사
    return clone;
  }
}

export default QueryBuilder;
