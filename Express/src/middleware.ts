import * as express from "express";
import { Application, NextFunction, Request, Response, Router } from "express";
import fs from "fs";
import path from "path";

// Express 미들웨어 함수의 타입
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// HTTP 메서드 타입
export type MiddlewareVerb =
  | "GET"
  | "POST"
  | "PUT"
  | "DELETE"
  | "PATCH"
  | "ALL";

// bodyParser 설정 (예시, 필요에 따라 확장)
export type ParserConfig = "json" | "urlencoded" | "raw" | "text" | false;

// 미들웨어 라우트 설정 객체의 타입
export type MiddlewareRoute = {
  method?: MiddlewareVerb | MiddlewareVerb[]; // 특정 HTTP 메서드에만 적용
  matcher: string | RegExp; // 미들웨어를 적용할 URL 경로 패턴
  bodyParser?: ParserConfig; // 해당 경로에 적용할 바디 파서
  middlewares: MiddlewareFunction[]; // 적용할 미들웨어 함수 배열
  priority: number;
};
const getBodyParserMiddleware = (
  parserConfig: MiddlewareRoute["bodyParser"]
) => {
  if (!parserConfig) return null;
  switch (parserConfig) {
    case "json":
      return express.json();
    case "urlencoded":
      return express.urlencoded({ extended: true });
    // case 'raw': return express.raw(); // 필요 시 추가
    // case 'text': return express.text(); // 필요 시 추가
    default:
      return null;
  }
};

/**
 * 설정된 전처리 미들웨어들을 Express 애플리케이션 또는 라우터에 적용합니다.
 * @param appOrRouter Express 애플리케이션 또는 라우터 인스턴스
 */
export async function applyConfiguredMiddlewares(appOrRouter: Router) {
  const config: MiddlewareRoute[] = await LoadMiddlewareRoutes();
  config.forEach((routeConfig) => {
    const { method, matcher, bodyParser, middlewares } = routeConfig;

    if (!middlewares || middlewares.length === 0) {
      console.warn(
        `Skipping middleware for matcher "${matcher}" - no middlewares provided.`
      );
      return;
    }

    const handlers: MiddlewareFunction[] = [];

    if (bodyParser) {
      const bodyParserMiddleware = getBodyParserMiddleware(bodyParser);
      if (bodyParserMiddleware) {
        handlers.push(bodyParserMiddleware as MiddlewareFunction);
      }
    }

    handlers.push(...middlewares);

    const methodsToApply: MiddlewareVerb[] = method
      ? Array.isArray(method)
        ? method
        : [method]
      : ["ALL"];

    methodsToApply.forEach((httpMethod) => {
      const lowercaseMethod = httpMethod.toLowerCase();

      if (lowercaseMethod === "all") {
        appOrRouter.use(matcher, ...handlers);
      } else if (
        typeof appOrRouter[lowercaseMethod as keyof (Application | Router)] ===
        "function"
      ) {
        (
          appOrRouter[
            lowercaseMethod as keyof (Application | Router)
          ] as Function
        )(matcher, ...handlers);
      } else {
        console.warn(
          `  - Unsupported HTTP method or invalid app/router instance for ${httpMethod} on ${matcher}`
        );
      }
    });
  });
}

interface MiddlewareModule {
  MATCHER: string | RegExp;
  MIDDLEWARES: any[];
  METHOD?: MiddlewareVerb | MiddlewareVerb[]; // 선택 사항: 특정 HTTP 메서드에만 적용
  PRIORITY?: number; // 우선순위
  default?: MiddlewareModule;
}

async function LoadMiddlewareRoutes() {
  const middlewaresPath = path.join(__dirname, "middlewares");
  const files = await fs.promises.readdir(middlewaresPath, {
    recursive: false,
    withFileTypes: false,
  });
  const loadedMiddlewareRoutes: MiddlewareRoute[] = [];
  for (const fileRelativePath of files) {
    const isFile =
      (fileRelativePath.endsWith(".ts") || fileRelativePath.endsWith(".js")) &&
      !fileRelativePath.endsWith(".d.ts");
    if (isFile) {
      const fullPath = path.join(middlewaresPath, fileRelativePath);
      const middlewareModule: MiddlewareModule = await import(fullPath);
      try {
        // const { matcher, middlewares, method, priority } = middlewareModule;
        const matcher =
          middlewareModule?.MATCHER || middlewareModule?.default?.MATCHER;
        const middlewares =
          middlewareModule?.MIDDLEWARES ||
          middlewareModule?.default?.MIDDLEWARES;
        const method =
          middlewareModule?.METHOD ||
          middlewareModule?.default?.METHOD ||
          "ALL";
        const priority =
          middlewareModule?.PRIORITY ||
          middlewareModule?.default?.PRIORITY ||
          0;

        if (matcher && middlewares) {
          loadedMiddlewareRoutes.push({
            matcher,
            middlewares,
            method,
            priority,
          });
        }
      } catch (error) {
        console.log("error : ", error);
      }
    }
  }
  // 오름차순
  return loadedMiddlewareRoutes.sort(
    (route1, route2) => route1.priority - route2.priority
  );
}
