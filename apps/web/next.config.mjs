import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // keep your existing options here
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
