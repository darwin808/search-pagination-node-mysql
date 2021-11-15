import express, { Request, Response } from "express";
import cors from "cors";
import { createConnection } from "typeorm";
import { Product } from "./entity/product";

const TABLE_NAME = "product";
const API = "/api/products";
const SEARCH_DB_QUERY =
  "product.title LIKE :search OR product.description LIKE :search";

createConnection().then((connection) => {
  const productRepository = connection.getRepository(Product);
  const app = express();
  app.use(
    cors({
      origin: "*",
    })
  );

  app.use(express.json());

  app.get(API, async (req: Request, res: Response) => {
    const { search, sort, perPage, page } = req.query;
    const builder = productRepository.createQueryBuilder(TABLE_NAME);

    if (req.query.search) {
      builder.where(SEARCH_DB_QUERY, {
        search: `%${search}%`,
      });
    }
    const sortBy: any = sort;

    if (sort) {
      builder.orderBy("product.price", sortBy.toUpperCase());
    }

    const currentPage: number = +(page as any) || 1;
    const itemsPerPage: number = +(perPage as any) || 9;
    const totalItems: number = await builder.getCount();

    builder.offset((currentPage - 1) * itemsPerPage).limit(itemsPerPage);

    const data: any[] = await builder.getMany();
    const lastPage: number = Math.ceil(totalItems / itemsPerPage);

    res.send({
      data,
      totalItems,
      currentPage,
      itemsPerPage,
      lastPage,
    });
  });

  app.listen(3000);
});
