export class XmlParser {
  constructor(options = {}) {
    this.defaultOptions = {
      hasCDATA: false,
      trimValues: true,
      allowEmpty: false,
      extractValue: false
    };
    this.options = { ...this.defaultOptions, ...options };
  }

  parse(xmlString, options = {}) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    if (xmlDoc.querySelector("parsererror")) {
      throw new Error("XML Parsing Error: " + xmlDoc.querySelector("parsererror").textContent);
    }

    const parseOptions = { ...this.options, ...options };

    // 루트 엘리먼트 체크 및 처리
    if (parseOptions.rootElement) {
      const rootElement = xmlDoc.querySelector(parseOptions.rootElement);
      if (!rootElement) {
        throw new Error(`Root element "${parseOptions.rootElement}" not found`);
      }
      return this._processResponseData(
        this._convertXmlToJson(rootElement, parseOptions),
        parseOptions
      );
    }

    return this._processResponseData(
      this._convertXmlToJson(xmlDoc, parseOptions),
      parseOptions
    );
  }

  _convertXmlToJson(xml, options) {
    // Text 또는 CDATA 노드
    if (xml.nodeType === 3 || xml.nodeType === 4) {
      const text = xml.nodeValue;
      // 공백만 있는 텍스트는 무시
      if (!text.trim() && !options.allowEmpty) {
        return null;
      }

      if (options.hasCDATA) {
        const cdataContent = this._extractCDATA(text);
        return options.trimValues ? cdataContent.trim() : cdataContent;
      }
      return options.trimValues ? text.trim() : text;
    }

    let obj = {};

    // Element node
    if (xml.nodeType === 1) {
      // 속성 처리
      if (xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }

      // 자식 노드 처리
      if (xml.hasChildNodes()) {
        const childNodes = Array.from(xml.childNodes).filter(node =>
          node.nodeType !== 8 && // 주석 제외
          (node.nodeType !== 3 || node.nodeValue.trim()) // 빈 텍스트 노드 제외
        );

        childNodes.forEach(item => {
          const nodeName = item.nodeName;
          const childObj = this._convertXmlToJson(item, options);

          if (childObj !== null) {
            if (typeof obj[nodeName] !== "undefined") {
              if (!Array.isArray(obj[nodeName])) {
                obj[nodeName] = [obj[nodeName]];
              }
              obj[nodeName].push(childObj);
            } else {
              obj[nodeName] = childObj;
            }
          }
        });
      }
    }

    return Object.keys(obj).length ? obj : null;
  }
  _extractCDATA(text) {
    const cdataRegex = /\s*<!\[CDATA\[(.*?)\]\]>\s*/;
    const match = text.match(cdataRegex);
    if (match) {
      return match[1];
    }
    return text.trim();
  }

  _processResponseData(data, options) {
    let result = data;

    if (options.targetTag) {
      result = this._extractTargetData(result, options.targetTag, options.isArray);
    }

    if (options.extractFields) {
      result = this._extractSpecificFields(result, options.extractFields, options.fieldOptions);
    }

    // 단일 값 처리
    if (options.isSingleValue && Array.isArray(result)) {
      result = result[0];
    }

    // 값 추출 (객체에서 실제 값만 추출)
    if (options.extractValue && result) {
      if (typeof result === 'object') {
        const values = Object.values(result)
          .filter(v => v !== null && v !== undefined && v !== '');
        result = values[0] || '';
      }
      // result가 string인 경우 그대로 반환
      return result;
    }

    return result;
  }
  _extractTargetData(data, targetTag, isArray = false) {
    const results = [];

    const extract = (obj) => {
      if (!obj || typeof obj !== 'object') return;

      if (obj[targetTag]) {
        if (Array.isArray(obj[targetTag])) {
          results.push(...obj[targetTag]);
        } else {
          results.push(obj[targetTag]);
        }
      }

      Object.values(obj).forEach(value => {
        if (typeof value === 'object') {
          extract(value);
        }
      });
    };

    extract(data);
    return isArray ? results : results[0];
  }

  _extractSpecificFields(data, fields, fieldOptions = {}) {
    if (Array.isArray(data)) {
      return data.map(item => this._extractSpecificFields(item, fields, fieldOptions));
    }

    if (!data || typeof data !== 'object') {
      return data;
    }

    const result = {};
    fields.forEach(field => {
      const fieldName = typeof field === 'object' ? field.field : field;
      const shouldTrim = typeof field === 'object' ? field.trim : false;

      if (data[fieldName] !== undefined || fieldOptions[fieldName]?.allowEmpty) {
        let value = data[fieldName];
        if (shouldTrim && typeof value === 'string') {
          value = value.trim();
        }
        result[fieldName] = value;
      }
    });

    return result;
  }
}