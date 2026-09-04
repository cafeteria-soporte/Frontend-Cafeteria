import { apiClient } from "@/api/apiClient";
import type {
  DssFilter,
  TabPrincipal,
  TabPredictivo,
  TabMarketing,
} from "../types";

const params = (f: DssFilter) => ({
  startDate: f.startDate,
  endDate: f.endDate,
  crisisMode: f.crisisMode ? "true" : undefined,
});

export const dssService = {
  tabPrincipal: async (f: DssFilter = {}): Promise<TabPrincipal> => {
    const res = await apiClient.get("/dss/tab-principal", { params: params(f) });
    return res.data as TabPrincipal;
  },

  tabPredictivo: async (f: DssFilter = {}): Promise<TabPredictivo> => {
    const res = await apiClient.get("/dss/tab-predictivo", { params: params(f) });
    return res.data as TabPredictivo;
  },

  tabMarketing: async (f: DssFilter = {}): Promise<TabMarketing> => {
    const res = await apiClient.get("/dss/tab-marketing", { params: params(f) });
    return res.data as TabMarketing;
  },
};
