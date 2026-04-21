import { BaseService } from "@/api/base.service";
import { ProductDto } from "../dto/product.dto";

class ProductsService extends BaseService {
  constructor() {
    super("/products", ProductDto);
  }
}

export const productsService = new ProductsService();
