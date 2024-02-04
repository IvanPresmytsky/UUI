import { ApiCallError, ApiContext } from '../ApiContext';

const delay = (time?: number) =>
    new Promise((resolve) => {
        setTimeout(resolve, time || 0);
    });

describe('ApiContext', () => {
    let context = new ApiContext({});

    const testData = { testData: 'test test' };

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const getFetchMock = (status: number, data?: any): any => {
        return jest.fn(() => {
            return Promise.resolve({
                json: () => Promise.resolve(data || testData),
                ok: status === 200,
                status: status,
            });
        });
    };

    afterEach(() => {
        (global.fetch as any).mockClear?.();
        context = new ApiContext({});
    });

    it('should make a request', async () => {
        const fetchMock = getFetchMock(200);
        global.fetch = fetchMock;

        await context.processRequest('path', 'POST', testData);
        expect(fetchMock).toBeCalledTimes(1);
        expect(fetchMock).toBeCalledWith('path', {
            headers,
            method: 'POST',
            body: JSON.stringify(testData),
            credentials: 'include',
        });
    });

    it('should handle api error', async () => {
        const fetchMock = getFetchMock(500);
        global.fetch = fetchMock;

        await context.processRequest('path', 'POST', testData).catch(() => {});
        const call = context.getActiveCalls()[0];

        expect(call.status).toEqual('error');
        expect(call.httpStatus).toEqual(500);
    });

    it('should handle connection lost', async () => {
        const fetchMock = getFetchMock(408);
        global.fetch = fetchMock;

        context.processRequest('path', 'POST', testData);
        await delay(100);

        const call: any = context.getActiveCalls()[0];
        expect(call.status).toEqual('scheduled');

        expect(fetchMock).toBeCalledWith('/auth/ping', {
            method: 'GET',
            credentials: 'include',
        });
    });

    it('should handle auth lost', async () => {
        const fetchMock = getFetchMock(401);
        global.fetch = fetchMock;

        const windowOpenMock = jest.fn(() => {});
        global.open = windowOpenMock as any;

        context.processRequest('path', 'POST', testData);
        await delay(100);

        const call: any = context.getActiveCalls()[0];
        expect(call.status).toEqual('scheduled');
        await delay();

        expect(windowOpenMock).toBeCalledWith('/auth/login');

        (global.open as any).mockClear();
    });

    it('should reject promise on api error with type manual', async () => {
        const fetchMock500 = getFetchMock(500);
        const fetchMock503 = getFetchMock(503);

        global.fetch = fetchMock500;
        await expect(context.processRequest('path', 'POST', testData, { errorHandling: 'manual' })).rejects.toEqual(new ApiCallError(null));

        global.fetch = fetchMock503;
        await expect(context.processRequest('path', 'POST', testData, { errorHandling: 'manual' })).rejects.toEqual(new ApiCallError(null));

        const call = context.getActiveCalls();

        expect(context.status).toEqual('idle');
        expect(call.length).toEqual(0);
    });

    it('should use custom fetcher', async () => {
        const customFetchMock = getFetchMock(200);
        context = new ApiContext({ fetch: customFetchMock });

        await context.processRequest('path', 'POST', testData);
        expect(customFetchMock).toBeCalledTimes(1);
    });

    it('should allow to process custom OK response formats with parseResponse', async () => {
        const fetchMock = jest.fn(() => {
            return Promise.resolve({
                blob: () => Promise.resolve(new Blob()),
                text: () => Promise.resolve('text error message'),
                ok: true,
                status: 200,
            } as any);
        });

        const parseResponse = (res: Response) => {
            return res.status === 200 ? res.blob() : res.text();
        };

        context = new ApiContext({ fetch: fetchMock });
        const result = await context.processRequest(
            'path',
            'POST',
            testData,
            { parseResponse },
        );

        expect(fetchMock).toBeCalledTimes(1);
        expect(result).toBeInstanceOf(Blob);
    });

    it('should allow to process custom error response formats with parseResponse', async () => {
        const fetchMock = jest.fn(() => {
            return Promise.resolve({
                blob: () => Promise.resolve(new Blob()),
                text: () => Promise.resolve('text error message'),
                ok: false,
                status: 500,
            } as any);
        });

        const parseResponse = (res: Response) => {
            return res.status === 200 ? res.blob() : res.text();
        };

        context = new ApiContext({ fetch: fetchMock });

        const error = await (context.processRequest(
            'path',
            'POST',
            testData,
            { parseResponse },
        ).catch((e) => e));

        expect(error.call.httpStatus).toBe(500);
        expect(error.call.responseData).toBe('text error message');
        expect(fetchMock).toBeCalledTimes(1);
        expect(context.status).toBe('error');
    });
});
