import { BaseModel, Category, ListedFile, ListedFileView } from "./model";

export const initialBaseModel: BaseModel = {
  id: null,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
};

export const initialListedFile: ListedFile = {
  ...initialBaseModel,
  name: "",
  categoryId: null,
};

export const initialCategory: Category = {
  ...initialBaseModel,
  name: "",
};
