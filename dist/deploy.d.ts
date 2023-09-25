/**
 * Used externally to listen for deployments & perform the deployment.
 *
 * @async
 * @param {function} fn - The function to be invoked during deployment.
 * @param {DeploymentPayload} fn.payload - The site bundle & destination repo.
 * @param {boolean} fn.create_new - Flag indicating whether a new repository should be created if it doesn't exist.
 * @returns {Promise<{DeploymentResponse}>} - A Promise that resolves to an object containing details of the deployment.
 */
export function deploy_subscribe(fn: Function): Promise<{
    DeploymentResponse;
}>;
export function deploy_unsubscribe(): void;
/**
 * Used internally to deploy the site
 * @param {DeploymentPayload} payload - The site bundle & destination repo
 * @param {boolean} create_new - Flag indicating whether a new repository should be created if it doesn't exist.
 * @returns {Promise<DeploymentResponse>}
 */
export function deploy(payload: DeploymentPayload, create_new: boolean): Promise<DeploymentResponse>;
export type File = {
    /**
     * - The data content of the file.
     */
    data: string;
    /**
     * - The name of the file.
     */
    file: string;
    /**
     * - The size of the file in bytes.
     */
    size: number;
};
export type DeploymentPayload = {
    /**
     * - Array containing files to be deployed.
     */
    files: Array<File>;
    /**
     * - The unique identifier for the site where the files will be deployed.
     */
    site_id: string;
    /**
     * - The name of the repository where the files will be stored.
     */
    repo_name: string;
};
export type DeploymentResponse = {
    /**
     * - Information about the repository where the files are stored.
     */
    repo: any;
    /**
     * - Unix timestamp representing when the deployment was created.
     */
    created: number;
    /**
     * - A unique identifier for the deployment.
     */
    deploy_id: string;
};
