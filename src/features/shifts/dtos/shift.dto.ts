
import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal } from "react";

export interface ShiftRecord {
  [x: string]: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | (() => ReactNode) | null | undefined;
  id: number;
  initialFund: number;
  declaredAmount: number | null;
  expectedAmount: number | null;
  discrepancy: number | null;
  status: "open" | "closed";
  discrepancyAlert: boolean;
  openedAt: string; // ISO 8601
  closedAt: string | null;
}

export interface OpenShiftDto {
  initialFund: number;
}

export interface CloseShiftDto {
  declaredAmount: number;
}

export interface ShiftQueryParams {
  page?: number;
  limit?: number;
  cashierId?: number;
  status?: "open" | "closed";
  from?: string; 
  to?: string;   
}