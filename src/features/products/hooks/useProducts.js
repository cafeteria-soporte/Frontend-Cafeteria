import { useCrud } from "@/hooks/useCrud";
import { productsService } from "../services/products.service";

export const useProducts = () => useCrud(productsService);
