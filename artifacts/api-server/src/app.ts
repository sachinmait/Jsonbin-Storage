import express, { type Express } from "express";
import cors from "cors";
import pinoHttpImport from "pino-http";
import type { IncomingMessage, ServerResponse } from "http";
import type { Logger } from "pino";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

type PinoHttpFn = (opts?: {
  logger?: Logger;
  serializers?: {
    req?: (req: IncomingMessage & { id?: string }) => Record<string, unknown>;
    res?: (res: ServerResponse) => Record<string, unknown>;
  };
}) => express.RequestHandler;

const pinoHttp = pinoHttpImport as unknown as PinoHttpFn;

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
