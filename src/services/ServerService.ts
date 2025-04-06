import { connectDB } from '../db/dbClient';

class ServerService {
  private static instance: ServerService;

  private constructor() {}

  public static async getInstance(): Promise<ServerService> {
    if (!this.instance) {
      this.instance = new ServerService();
      await connectDB();
    }
    return this.instance;
  }

}
export default ServerService;