import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.etsystatic.com",
        port: "",
        pathname: "/**",
      },

      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pantalonesdemezclilla.mx",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "periodicocorreo.com.mx",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "shasa.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myspringfield.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ss849.suburbia.com.mx",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "erivel.mx",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "calvinkleinmx.vteximg.com.br",
        port: "",
        pathname: "/**",
      },
      // Added missing domain for next/image usage
      {
        protocol: "https",
        hostname: "www.innvictus.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "http2.mlstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ss421.liverpool.com.mx",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "app.cuidadoconelperro.com.mx",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.hm.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ae-pic-a1.aliexpress-media.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vittorioforti.com.mx",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'pg', 'pg-hstore', 'sqlite3', 'tedious', 'oracledb'];
    return config;
  },
};

export default nextConfig;
