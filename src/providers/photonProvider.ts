import AbstractProvider, {
  EndpointArgument,
  ParseArgument,
  SearchResult,
  ProviderParams
} from './provider';

export interface RequestResult {
  features: RawResult[];
}

export interface RawResult {
      geometry: {
        coordinates: [number, number];
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

function get_label(props: any): string {
  let s = props.name;
  if (props.type == "country") {
    return s;
  }
  if (s === undefined) {
    // Assuming anything without a name is an address.
    s = `${props.housenumber} ${props.street}`;
  }
  for (const prop of ['state', 'county', 'city', 'district']) {
    if (prop in props) {
      s += `, ${props[prop]}`;
      break;
    }
  }
  s += `, ${props.country}`;
  return s;
}

function get_bounds(props: any): any {
  if ("extent" in props) {
    return [
      [props.extent[3], props.extent[2]], // s, w
      [props.extent[1], props.extent[0]], // n, e
    ];
  }
  return null;
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
      .map((r) => ({
        x: r.geometry.coordinates[0],
        y: r.geometry.coordinates[1],
        label: get_label(r.properties),
        bounds: get_bounds(r.properties),
        raw: r
      }));
  }
}
