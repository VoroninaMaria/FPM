export type DatexConnectionPool = {
  min: 2;
  max: 10;
};

export type DatexConnection = {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  pool?: DatexConnectionPool;
};
