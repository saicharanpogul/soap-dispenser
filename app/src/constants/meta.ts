export const DEFAULT_META = {
  title: "SOAP - Solana POAP",
  description: "SOAP: POAP on Solana using cNFTs.",
  image: "https://csoap.saicharanpogul.xyz/ogImage.png",
};

export const getPathMetadata = (
  path: string,
  props?: { title?: string; description?: string; image?: string }
) => {
  const defaultTitle = DEFAULT_META.title;
  const modifiedProps = props && {
    ...props,
    title: `${props.title} | ${defaultTitle}`,
  };
  const base = {
    metadataBase: new URL("https://csoap.saicharanpogul.xyz"),
    title: defaultTitle,
    description: DEFAULT_META.description,
    image: DEFAULT_META.image,
    ...modifiedProps,
  };
  const openGraph = {
    images: [{ url: DEFAULT_META.image }],
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    type: "website",
    url: `https://csoap.saicharanpogul.xyz${path}`,
    ...modifiedProps,
  };
  const twitter = {
    title: DEFAULT_META.title,
    description: DEFAULT_META.description,
    image: DEFAULT_META.image,
    cardType: "summary_large_image",
    url: `https://csoap.saicharanpogul.xyz${path}`,
    ...modifiedProps,
  };
  const icons = [
    {
      rel: "icon",
      type: "image/png",
      sizes: "24x24",
      url: "favicon.ico",
    },
  ];
  return { ...base, openGraph, twitter, icons };
};
