import axios from "axios";
import { v4 as uuidv4 } from "uuid";

interface DistanceMatrixResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: {
    elements: {
      distance: {
        text: string;
        value: number;
      };
      duration: {
        text: string;
        value: number;
      };
      status: string;
    }[];
  }[];
  status: string;
}

interface RouteLeg {
  id: string;
  pointA: string;
  pointB: string;
  distance: {
    value: number;
    text: string;
  };
  duration: {
    value: number;
    text: string;
  };
}

interface OptimalRouteResult {
  route: RouteLeg[];
  totalDistance: number;
  totalDuration: number;
}

class GoogleMatrixAPI {
  private apiKey: string;
  private baseUrl: string =
    "https://maps.googleapis.com/maps/api/distancematrix/json";
  private batchSize: number = 10;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async getDistanceMatrixBatch(
    origins: string[],
    destinations: string[]
  ): Promise<DistanceMatrixResponse> {
    try {
      const response = await axios.get<DistanceMatrixResponse>(this.baseUrl, {
        params: {
          origins: origins.join("|"),
          destinations: destinations.join("|"),
          key: this.apiKey,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error making request:", error.message);
        throw new Error(`Failed to get distance matrix: ${error.message}`);
      } else {
        console.error("Unexpected error:", error);
        throw new Error("An unexpected error occurred");
      }
    }
  }

  async getDistanceMatrix(
    origins: string[],
    destinations: string[]
  ): Promise<DistanceMatrixResponse> {
    const batchedResponses: DistanceMatrixResponse[] = [];

    for (let i = 0; i < origins.length; i += this.batchSize) {
      for (let j = 0; j < destinations.length; j += this.batchSize) {
        const originBatch = origins.slice(i, i + this.batchSize);
        const destBatch = destinations.slice(j, j + this.batchSize);
        const batchResponse = await this.getDistanceMatrixBatch(
          originBatch,
          destBatch
        );
        batchedResponses.push(batchResponse);
      }
    }

    // Combine batched responses
    const combinedResponse: DistanceMatrixResponse = {
      destination_addresses: destinations,
      origin_addresses: origins,
      rows: [],
      status: "OK",
    };

    for (let i = 0; i < origins.length; i++) {
      const row: { elements: any[] } = { elements: [] };
      for (let j = 0; j < destinations.length; j++) {
        const batchIndex =
          Math.floor(i / this.batchSize) *
            Math.ceil(destinations.length / this.batchSize) +
          Math.floor(j / this.batchSize);
        const batchRowIndex = i % this.batchSize;
        const batchColIndex = j % this.batchSize;
        row.elements.push(
          batchedResponses[batchIndex].rows[batchRowIndex].elements[
            batchColIndex
          ]
        );
      }
      combinedResponse.rows.push(row);
    }

    return combinedResponse;
  }

  private createDistanceAndDurationMatrices(response: DistanceMatrixResponse): {
    distanceMatrix: number[][];
    durationMatrix: number[][];
  } {
    const n = response.destination_addresses.length;
    const distanceMatrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));
    const durationMatrix: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        distanceMatrix[i][j] = response.rows[i].elements[j].distance.value;
        durationMatrix[i][j] = response.rows[i].elements[j].duration.value;
      }
    }

    return { distanceMatrix, durationMatrix };
  }

  private nearestNeighborTSP(distanceMatrix: number[][]): number[] {
    const n = distanceMatrix.length;
    const unvisited = new Set(Array.from({ length: n - 1 }, (_, i) => i + 1));
    const path: number[] = [0];

    while (unvisited.size > 0) {
      const last = path[path.length - 1];
      const next = Array.from(unvisited).reduce((a, b) =>
        distanceMatrix[last][a] < distanceMatrix[last][b] ? a : b
      );
      unvisited.delete(next);
      path.push(next);
    }

    path.push(0); // Return to start
    return path;
  }

  async getOptimalRoute(addresses: string[]): Promise<OptimalRouteResult> {
    const response = await this.getDistanceMatrix(addresses, addresses);
    const { distanceMatrix, durationMatrix } =
      this.createDistanceAndDurationMatrices(response);
    const optimalPath = this.nearestNeighborTSP(distanceMatrix);

    let totalDistance = 0;
    let totalDuration = 0;
    const route: RouteLeg[] = [];

    for (let i = 0; i < optimalPath.length - 1; i++) {
      const fromIndex = optimalPath[i];
      const toIndex = optimalPath[i + 1];

      const leg: RouteLeg = {
        id: uuidv4(),
        pointA: addresses[fromIndex],
        pointB: addresses[toIndex],
        distance: {
          value: distanceMatrix[fromIndex][toIndex],
          text: `${(distanceMatrix[fromIndex][toIndex] / 1000).toFixed(2)} km`,
        },
        duration: {
          value: durationMatrix[fromIndex][toIndex],
          text: `${Math.round(durationMatrix[fromIndex][toIndex] / 60)} mins`,
        },
      };

      route.push(leg);
      totalDistance += leg.distance.value;
      totalDuration += leg.duration.value;
    }

    return {
      route,
      totalDistance,
      totalDuration,
    };
  }
}

export default GoogleMatrixAPI;
