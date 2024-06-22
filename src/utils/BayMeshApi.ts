// bayme.sh data api lib 

export interface NodeInfo {
  id: string;
  longName: string;
  shortName: string;
  macaddr: string;
  hwModel: string;
  role: string;
  hopStart: number;
  updatedAt: number;
}

export interface NodeLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  time: Date;
}

class BayMeshApi {
  url: string;

  constructor(url: string = 'https://data.bayme.sh/api') {
    this.url = url;
  }

  getNodeInfo(nodeHexId: string): Promise<NodeInfo> {
    return this.apiGet(`/node/info/${nodeHexId}`)
  }

  getNodeLocation(nodeHexId: string): Promise<NodeLocation[]> {
    return this.apiGet(`/coverage/${nodeHexId}?limit=1`)
  }

  async apiGet(path: string) {
    const response = await fetch(`${this.url}${path}`);
    return response.json();
  }
}

export default BayMeshApi;