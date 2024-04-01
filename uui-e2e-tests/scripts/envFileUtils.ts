import dotenv from 'dotenv';
import path from 'node:path';
import { readEnvParams } from './cliUtils';
import { ENV_FILES, HOST_IP_PH } from './constants';

const { isCi, UUI_DOCKER_HOST_MACHINE_IP = 'localhost' } = readEnvParams();

const envFileName = isCi ? ENV_FILES.CI : ENV_FILES.LOCAL;

type TEnvParams = { UUI_APP_BASE_URL: string };

export function readEnvFile(): TEnvParams {
    const processEnv = {} as TEnvParams;
    dotenv.config({
        processEnv,
        path: path.resolve(__dirname, '..', envFileName),
    });
    if (processEnv.UUI_APP_BASE_URL) {
        const hostIp = UUI_DOCKER_HOST_MACHINE_IP;
        if (hostIp) {
            processEnv.UUI_APP_BASE_URL = processEnv.UUI_APP_BASE_URL.replace(HOST_IP_PH, hostIp);
        }
    } else {
        throw new Error(`UUI_APP_BASE_URL must be defined in ${envFileName}`);
    }
    return processEnv;
}
