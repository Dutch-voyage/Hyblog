declare module "cloudflare:workers" {
  export const env: {
    DEMOS_BUCKET?: import("@cloudflare/workers-types").R2Bucket;
  };
}
