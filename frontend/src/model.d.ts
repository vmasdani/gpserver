export interface BaseModel {
  id: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListedFile extends BaseModel {
  name: string | null;
  categoryId: string | null;
}

export interface Category extends BaseModel {
  name: string | null;
}

export interface Tag extends BaseModel {
  name: string | null;
}

export interface ListedFileView {
  path: string | null;
  size: number | null;
  listedFile: ListedFile | null;
  category: Category | null;
  tags: Tag[];
  previewBase64: string | null;
}
