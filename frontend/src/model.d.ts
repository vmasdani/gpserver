export interface BaseModel {
  id: number | null;
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface ListedFile extends BaseModel {
  name: string | null;
  categoryId: number | null;
}

export interface Category extends BaseModel {
  name: string | null;
}

export interface Tag extends BaseModel {
  name: string | null;
}

export interface ListedFileTag extends BaseModel {
  tagId: number | null;
  listedFileId: number | null;
}

export interface ListedFileTagView {
  listedFileTag: ListedFileTag | null;
}

export interface ListedFileView {
  path: string | null;
  size: number | null;
  listedFile: ListedFile | null;
  category: Category | null;
  listedFileTags: ListedFileTagView[];
  previewBase64: string | null;
}

export interface PagedInfo {
  last: number | null;
  page: number | null;
  size: number | null;
  content: ListedFileView[] | null;
}
