type CloudinaryImageTransformOptions = {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string;
  format?: string;
  dpr?: string;
};

function buildTransformationSegment({
  width,
  height,
  crop,
  gravity,
  quality = "auto",
  format = "auto",
  dpr = "auto",
}: CloudinaryImageTransformOptions) {
  return [
    format ? `f_${format}` : null,
    quality ? `q_${quality}` : null,
    dpr ? `dpr_${dpr}` : null,
    crop ? `c_${crop}` : null,
    gravity ? `g_${gravity}` : null,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
  ]
    .filter(Boolean)
    .join(",");
}

export function buildCloudinaryTransformedUrl(
  imageUrl: string,
  options: CloudinaryImageTransformOptions = {},
) {
  if (!imageUrl.includes("/image/upload/")) {
    return imageUrl;
  }

  const transformationSegment = buildTransformationSegment(options);

  if (!transformationSegment) {
    return imageUrl;
  }

  const [baseUrl, query = ""] = imageUrl.split("?");
  const transformedUrl = baseUrl.replace(
    "/image/upload/",
    `/image/upload/${transformationSegment}/`,
  );

  return query ? `${transformedUrl}?${query}` : transformedUrl;
}
