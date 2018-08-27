
export default class CacheFile{
  data: string;
  contentType: string;
  constructor(data: string, contentType: string){
    this.data = data;
    this.contentType = contentType;
  }

}
