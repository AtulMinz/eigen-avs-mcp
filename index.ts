import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import { config } from "dotenv";

config();

const server = new McpServer({
  name: "Eigen AVS",
  version: "0.1.0",
});

server.tool(
  "getAVS",
  {
    fullPrompt: z.string().describe("The complete user query about AVS data"),
    avsName: z
      .string()
      .optional()
      .describe("Optional specific name to focus on"),
  },
  async ({ fullPrompt, avsName }) => {
    try {
      const response = await axios.get("https://api.eigenexplorer.com/avs", {
        headers: {
          "X-API-Token": process.env.EIGEN_API || "",
        },
      });
      const json = await response.data();
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: "Error fetching data....",
          },
        ],
      };
    }
  }
);
