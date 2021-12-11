
import _fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

import { sleep } from '../src/lib/sleep';

const MAX_QUEUE_SIZE = 100;
const CONCURRENT_REQUEST_WAIT_MS = 50;
const REQUEST_QUEUE = [];

let concurrentRequests = 0;

export async function fetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  let resp: Response;
  while(concurrentRequests >= MAX_QUEUE_SIZE) {
    await sleep(CONCURRENT_REQUEST_WAIT_MS);
  }
  concurrentRequests++;
  resp = await _fetch(url, init);
  concurrentRequests--;
  return resp;
}
