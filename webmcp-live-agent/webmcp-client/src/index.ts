export interface WebMCPManifest {
  appName: string;
  systemInstruction: string;
}

export interface WebMCPTool<TResult = any> {
  name: string;
  description: string;
  parameters: Record<string, any>;
  passNamedArguments?: boolean;
  execute: (...args: any[]) => Promise<TResult> | TResult;
}

export interface WebMCP {
  manifest: WebMCPManifest | null;
  init: (manifest: WebMCPManifest) => void;
  getManifest: () => WebMCPManifest | null;
  tools: WebMCPTool[];
  registerTool: (tool: WebMCPTool) => void;
  getTools: () => WebMCPTool[];
  executeTool: (toolName: string, args: Record<string, any>) => any;
}

const webmcp: WebMCP = {
  manifest: null,
  init(manifest: WebMCPManifest) {
    this.manifest = manifest;
  },
  getManifest() {
    return this.manifest;
  },
  tools: [],
  registerTool(tool) {
    this.tools = this.tools.filter(t => t.name !== tool.name);
    this.tools.push(tool);
  },
  getTools() {
    return this.tools;
  },
  executeTool(toolName: string, args: Record<string, any>) {
    const tool = this.tools.find(t => t.name === toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found in window.webmcp`);

    if (tool.passNamedArguments) {
      return tool.execute(args);
    }

    const paramKeys = Object.keys(tool.parameters || {});
    const positionalArgs = paramKeys.map(key => args[key]);
    return tool.execute(...positionalArgs);
  }
};

(window as any).webmcp = webmcp;

export default webmcp;
