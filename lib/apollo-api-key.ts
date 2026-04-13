export function readApolloApiKeyFromEnv(): string {
  const raw =
    process.env.APOLLO_API_KEY?.trim() ??
    process.env.APOLLO_IO_API_KEY?.trim() ??
    "";
  return raw;
}
