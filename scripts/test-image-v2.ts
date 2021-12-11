
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { fetch } from './fetch-queue';
import { Response } from 'node-fetch';
import queryString, { ParsedUrl } from 'query-string';

import { Timer } from '../src/lib/timer';
import { COVER_URIS, COVER_URI_ENUM, GALLERY_URIS, GALLERY_URI_ENUM } from './test-constants';
import { parse } from 'path';

async function testImageV2Main() {
  let allUris: string[], resizeUris: string[], timer: Timer;
  let syncFetchMs: number, syncFetchCacheMs: number,
    asyncResizeMs: number;
  let asyncFetchMs: number;

  allUris = [];
  Object.keys(COVER_URIS).forEach(coverUriKey => {
    allUris.push(COVER_URIS[coverUriKey as COVER_URI_ENUM]);
  });
  Object.keys(GALLERY_URIS).forEach(galleryUriKey => {
    allUris.push(...GALLERY_URIS[galleryUriKey as GALLERY_URI_ENUM]);
  });

  // timer = Timer.start();
  // await fetchSync(allUris);
  // syncFetchMs = timer.stop();
  // console.log(`fetch sync took: ${(Math.round(syncFetchMs)).toLocaleString()} ms`);
  
  timer = Timer.start();
  await fetchUrisAsync(allUris, (currIdx: number) => {
    const printMod = Math.floor(allUris.length / 50);
    // console.log(printMod);
    if((currIdx % printMod) === 0) {
      process.stdout.write('.');
    }
  });
  asyncFetchMs = timer.stop();
  console.log(`async fetch took: ${Math.round(asyncFetchMs).toLocaleString()} ms`);
  
  resizeUris = allUris.map(uri => {
    let resizedUri: string;
    resizedUri = getResizeUri(uri, 100);
    return resizedUri;
  });
  resizeUris = generateResizeUris(allUris)
  console.log(resizeUris.length.toLocaleString());
  timer = Timer.start();
  await fetchUrisAsync(resizeUris, (currIdx: number) => {
    const printMod = Math.floor(resizeUris.length / 80);
    if((currIdx % printMod) === 0) {
      process.stdout.write('.');
    }
  });
  asyncResizeMs = timer.stop();
  console.log(`async resize fetch took: ${Math.round(asyncResizeMs).toLocaleString()} ms`);
}

function generateResizeUris(uris: string[]) {
  let min: number, max: number;
  let resultUris: string[];
  min = 25;
  max = 50;
  resultUris = [];
  for(let i = 0; i < (max - min); ++i) {
    let currWidth: number;
    currWidth = min + i;
    for(let k = 0; k < uris.length; ++k) {
      let currUri: string;
      currUri = uris[k];
      resultUris.push(getResizeUri(currUri, currWidth));
    }
  }
  return resultUris;
}

function getResizeUri(uri: string, width: number) {
  let parsed: ParsedUrl;
  parsed = queryString.parseUrl(uri);
  parsed.query.width = `${width}`;
  return queryString.stringifyUrl({
    url: parsed.url,
    query: parsed.query,
  });
}

async function fetchImage(uri: string) {
  let resp: Response, bytes: number;
  bytes = 0;
  resp = await fetch(uri);
  await new Promise<Response>((resolve, reject) => {
    resp.body.on('data', (chunk: Buffer) => {
      bytes += chunk.toString().length;
    });
    resp.body.on('end', () => {
      resolve(resp);
    })
    resp.body.on('error', err => {
      reject(err);
    });
  });
  resp.size = bytes;
  return resp;
}

async function fetchSync(uris: string[]) {
  for(let i = 0; i < uris.length; ++i) {
    let currUri: string, resp: Response;
    currUri = uris[i];
    process.stdout.write('.');
    // console.log(currUri);
    resp = await fetchImage(currUri);
    // const body = await resp.text();
    // console.log(`  ${(body.length / (1024 ** 2)).toLocaleString()} mb`);
  }
  process.stdout.write('\n');
}

async function fetchUrisAsync(uris: string[], completeCb?: (currIdx: number) => void) {
  let requestPromises: Promise<Response>[];
  if(completeCb === undefined) {
    completeCb = (currIdx: number): void => {
      process.stdout.write('.');
    }
  }
  requestPromises = uris.map((imgUri, idx) => {
    return fetchImage(imgUri).then(resp => {
      completeCb(idx);
      return resp;
    });
  });
  await Promise.all(requestPromises);
  process.stdout.write('\n');
}

(async () => {
  try {
    await testImageV2Main();
  } catch(e) {
    console.error(e);
    throw e;
  }
})();
