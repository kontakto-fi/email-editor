import EMPTY_EMAIL_MESSAGE from './sample/empty-email-message';

export default async function getConfiguration(template: string): Promise<any> {
  // Handle sample templates with dynamic loading
  if (template.startsWith('#sample/')) {
    const sampleName = template.replace('#sample/', '');
    try {
      // Dynamic import based on the sample ID
      const module = await import(`./sample/${sampleName}`);
      return module.default;
    } catch (error) {
      // Fall back to empty template if sample not found
      console.warn(`Sample template not found: ${sampleName}`, error);
      return EMPTY_EMAIL_MESSAGE;
    }
  }

  // Handle encoded configuration
  if (template.startsWith('#code/')) {
    const encodedString = template.replace('#code/', '');
    const configurationString = decodeURIComponent(atob(encodedString));
    try {
      return JSON.parse(configurationString);
    } catch {
      console.error(`Couldn't load configuration from hash.`);
    }
  }

  return EMPTY_EMAIL_MESSAGE;
}

// Add a synchronous version for initial load
export function getConfigurationSync(template: string): any {
  // For initial load, we use the empty template
  // This avoids async issues during initial component mounting
  return EMPTY_EMAIL_MESSAGE;
}
