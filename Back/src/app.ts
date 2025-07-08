import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import { config } from './middleware';
import * as path from 'path';
import { applyConfiguredMiddlewares } from './utils';
import dotenv from 'dotenv';

dotenv.config();
const env = process.env.NODE_ENV || 'development'; // NODE_ENV가 설정되지 않았다면 'development'를 기본값으로
const envPath = path.resolve(__dirname, `../.env.${env}`); // 현재 파일 기준으로 .env 파일 경로 설정
dotenv.config({ path: envPath, override: true });

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


type ApiHandler = (req: Request, res: Response, next?: NextFunction) => void | Promise<void>;

interface ApiModule {
    GET?: ApiHandler;
    POST?: ApiHandler;
    DELETE?: ApiHandler;
    PUT?: ApiHandler;
    PATCH?: ApiHandler;
}

const API_BASE_DIR = path.join(__dirname, 'api'); // src/api 경로
const API_URL_PREFIX = '/api'; // 모든 API 라우트의 시작 부분

export async function loadApiRoutes(appRouter: Router) {
    console.log('Loading API routes from:', API_BASE_DIR);

    try {
        const files = await fs.promises.readdir(API_BASE_DIR, { recursive: true, withFileTypes: false });

        for (const fileRelativePath of files) {
            if (fileRelativePath.endsWith('route.ts') && !fileRelativePath.endsWith('.d.ts')) {
                const fullPath = path.join(API_BASE_DIR, fileRelativePath);

                let urlPath = '/' + fileRelativePath
                    .replace(/\\/g, '/')
                    .replace(/\/route\.ts$/, '')
                    .replace('route.ts', '')

                urlPath = urlPath.replace(/\[(\w+)\]/g, ':$1');

                if (urlPath === '/') {
                    urlPath = '';
                }

                const fullUrl = `${API_URL_PREFIX}${urlPath}`;

                try {
                    const apiModule: ApiModule = await import(fullPath);
                    // 여기서도 핸들러 함수를 등록할 때 next 인자는 전달하지 않아도 됩니다.
                    if (apiModule.GET) {
                        appRouter.get(urlPath, apiModule.GET);
                    }
                    if (apiModule.POST) {
                        appRouter.post(urlPath, apiModule.POST);
                    }
                    if (apiModule.PUT) {
                        appRouter.put(urlPath, apiModule.PUT);
                    }
                    if (apiModule.DELETE) {
                        appRouter.delete(urlPath, apiModule.DELETE);
                    }
                    if (apiModule.PATCH) {
                        appRouter.patch(urlPath, apiModule.PATCH);
                    }

                } catch (importError) {
                    console.error(`Error importing ${fullPath}:`, importError);
                }
            }
        }
    } catch (err) {
        console.error('Failed to read API directory:', err);
    }
}

applyConfiguredMiddlewares(app, config);

const apiRouter = express.Router();
loadApiRoutes(apiRouter)
    .then(() => {
        app.use('/', apiRouter);

        // --- 전역 에러 처리 미들웨어 (항상 모든 라우트 및 미들웨어 정의 후 마지막에 위치) ---
        app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            console.error('전역 오류 발생:', err.stack);
            res.status(500).json({ message: '서버에서 예상치 못한 오류가 발생했습니다.' });
        });
        // 서버 시작
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Failed to load API routes:', error);
        process.exit(1); // 라우트 로딩 실패 시 서버 종료
    });

export default app;