import { Category, ListedFileView, Tag } from "./model";

export const matchExtension = (fileName: string) => {
  if (fileName.match(/\.(mp4|mov|webm|3gp|mkv)/)) {
    return "movie";
  } else if (fileName.match(/\.(jpg|jpeg|png)/)) {
    return "image";
  } else if (fileName.match(/\.(gif)/)) {
    return "gif";
  } else {
    return "others";
  }
};

export const fetchListedCheck = async (pars: {
  baseUrl?: string | null | undefined;
  apiKey?: string | null | undefined;
}) => {
  try {
    const resp = await fetch(`${pars?.baseUrl}/listed-check`, {
      headers: { authorization: pars.apiKey ?? "" },
    });

    if (resp.status !== 200) throw await resp.text();
    return (await resp.json()) as ListedFileView[];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchCategories = async (pars: {
  baseUrl?: string | null | undefined;
  apiKey?: string | null | undefined;
}) => {
  try {
    const resp = await fetch(`${pars?.baseUrl}/categories`, {
      headers: { authorization: pars.apiKey ?? "" },
    });

    if (resp.status !== 200) throw await resp.text();
    return (await resp.json()) as Category[];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const fetchTags = async (pars: {
  baseUrl?: string | null | undefined;
  apiKey?: string | null | undefined;
}) => {
  try {
    const resp = await fetch(`${pars?.baseUrl}/tags`, {
      headers: { authorization: pars.apiKey ?? "" },
    });

    if (resp.status !== 200) throw await resp.text();
    return (await resp.json()) as Tag[];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export type RequestStatus = "NotAsked" | "Loading" | "Success" | "Error";
