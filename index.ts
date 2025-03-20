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

      const claudeResponse = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3.5",
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: `You are an EigenLayer AVS Data Assistant. Your task is to analyse AVS data and response to user queries.
              

                Here is the AVS data from the EigenExplorer API:
                ${JSON.stringify(json, null, 2)}


                User query: ${fullPrompt}
                AVS name: ${avsName}

                Provide detailed well-structured reponse that directly addresses user queries.
              `,
            },
          ],

          headers: {
            "x-api-key": process.env.CLAUDE_API_KEY || "",
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
        }
      );

      const data = await claudeResponse.data();

      return {
        content: [
          {
            type: "text",
            text: `${data.content[0].text}`,
          },
        ],
      };
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

async function avsServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

avsServer();
