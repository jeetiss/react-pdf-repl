import LZString from "lz-string";
import { deflate, inflate } from "pako";
import { Buffer } from "buffer";

const makeQueryFriendly = (str) =>
  str
    .replace(/\+/g, "-") // Convert '+' to '-'
    .replace(/\//g, "_") // Convert '/' to '_'
    .replace(/=+$/, ""); // Remove ending '='

const revertQueryFriendly = (str) =>
  str
    .replace(/-/g, "+") // Convert '-' to '+'
    .replace(/_/g, "/"); // Convert '_' to '/'

export const compress = (string) =>
  makeQueryFriendly(LZString.compressToBase64(string));

export const decompress = (string) =>
  LZString.decompressFromBase64(revertQueryFriendly(string));

export const gzCompress = (string) =>
  makeQueryFriendly(Buffer.from(deflate(string)).toString("base64"));

export const gzDecompress = (string) =>
  inflate(Buffer.from(revertQueryFriendly(string), "base64"), {
    to: "string",
  });
