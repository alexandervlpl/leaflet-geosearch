import AbstractProvider, {
  EndpointArgument,
  LatLng,
  ParseArgument,
  SearchResult,
  ProviderParams
} from './provider';

export interface RequestResult {
  features: RawResult[];
}

export interface RawResult {
      geometry: {
        coordinates: LatLng;
        type: string;
      },
      type: string;
      properties: {
        osm_type: string;
        osm_id: number;
        extent: [number, number, number, number];
        country: string;
        osm_key: string;
        countrycode: string;
        osm_value: string;
        name: string;
        state: string;
        type: string;
      }
}

export default class PhotonProvider extends AbstractProvider<
  RequestResult,
  RawResult
> {
  searchUrl = this.options.url as string;

  getParamString(params: ProviderParams = {}): string {
    let pstr = super.getParamString(params);
    if (this.options.map !== undefined) {
      let center = (this.options.map as any).getCenter();
      let zoom = (this.options.map as any).getZoom();
      pstr += `&lat=${center.lat}&lon=${center.lng}&zoom=${zoom}`;
    }
    return pstr;
  }

  endpoint({ query }: EndpointArgument): string {
    const params = typeof query === 'string' ? { q: query } : query;
    return this.getUrl(this.searchUrl, params);
  }

  parse(response: ParseArgument<RequestResult>): SearchResult<RawResult>[] {
    return response.data.features
      //.filter((r) => r.geometry.coordinates !== undefined)
      .map((r) => ({
        x: r.geometry.coordinates.lng,
        y: r.geometry.coordinates.lat,
        label: `${r.properties.name}, ${r.properties.country}`, //FIXME: generate useful label
        bounds: null,
        raw: r,
      }));
  }
}
