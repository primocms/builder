<script context="module">
	let JSZip, saveFile
	import('jszip').then((module) => (JSZip = module.default))
	import('file-saver').then((module) => (saveFile = module.saveAs))
</script>

<script>
	import axios from 'axios'
	import Icon from '@iconify/svelte'
	import _ from 'lodash-es'
	import { fade } from 'svelte/transition'
	import { format } from 'timeago.js'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Select from '$lib/ui/inputs/Select.svelte'
	import modal from '$lib/stores/app/modal'
	import Spinner from '$lib/ui/Spinner.svelte'
	import DropdownButton from '$lib/ui/DropdownButton.svelte'
	import site, { active_deployment } from '$lib/stores/data/site'
	import pages from '$lib/stores/data/pages'
	import symbols from '$lib/stores/data/symbols'
	import { push_site, build_site_bundle } from './Deploy'
	import PrimaryButton from '$lib/ui/PrimaryButton.svelte'
	import { dataChanged } from '$lib/database'

	let stage = 'INITIAL'

	if ($active_deployment) {
		stage = 'ACTIVE'
	}

	let fetched_git_account = false

	let github_account = $site.active_deployment?.repo?.owner
	if (!github_account) {
		axios
			.get(`/api/deploy/user?provider=github`)
			.then(({ data }) => {
				if (data) {
					github_account = data
					fetched_git_account = true
				}
			})
			.catch((e) => {
				console.error({ e })
				fetched_git_account = true
			})
	} else {
		fetched_git_account = true
	}

	let gitlab_account = $site.active_deployment?.repo?.owner
	if (!gitlab_account) {
		axios
			.get(`/api/deploy/user?provider=gitlab`)
			.then(({ data }) => {
				if (data) {
					gitlab_account = data
					fetched_git_account = true
				}
			})
			.catch((e) => {
				console.error({ e })
				fetched_git_account = true
			})
	}

	async function download_site() {
		loading = true
		const files = await build_site_bundle({ pages: $pages, symbols: $symbols })
		if (!files) {
			loading = false
			return
		}
		const bundle = await create_site_zip(files)
		saveFile(bundle, `${$site.name}.zip`)
		modal.hide()

		async function create_site_zip(files) {
			const zip = new JSZip()
			files.forEach(({ path, content }) => {
				zip.file(path, content)
			})
			return await zip.generateAsync({ type: 'blob' })
		}
	}

	/**
	 * @param {Event} e
	 * @param {'github' | 'gitlab'} provider
	 * @returns {Promise<void>}
	 */
	async function connect_git(e, provider) {
		const user_token = e.target[0]['value']

		let user_data
		if (provider === 'github') {
			const res = await axios.get(`https://api.github.com/user`, {
				headers: { Authorization: `Bearer ${user_token}`, Accept: 'application/vnd.github.v3+json' }
			})
			user_data = res.data
			github_account = res.data
		} else if (provider === 'gitlab') {
			const res = await axios.get(`https://gitlab.com/api/v4/user`, {
				headers: { Authorization: `Bearer ${user_token}` }
			})
			user_data = res.data
			gitlab_account = res.data
		}

		if (user_data) {
			stage = `DEPLOY--${provider}`
			await dataChanged({
				table: 'config',
				action: 'upsert',
				id: `${provider}_token`,
				data: { id: `${provider}_token`, value: user_token, options: { user: user_data } }
			})
		}
	}

	/**
	 * @param {{
	 *   name: string,
	 *   provider: 'github' | 'gitlab',
	 *   create_repo: boolean
	 * }}
	 * @returns {Promise<void>}
	 */
	async function deploy_to_repo({ name, provider, create_repo = false }) {
		loading = true
		const deployment = await push_site({ repo_name: name, provider }, create_repo)
		if (deployment) {
			$active_deployment = deployment
			stage = 'ACTIVE__DEPLOYED'
		} else {
			alert('Could not deploy to repo')
		}
		loading = false
	}

	async function get_repos(provider) {
		const { data } = await axios.get(`/api/deploy/repos?provider=${provider}`)
		return data
	}

	const Title = (stage) => {
		const titles = {
			INITIAL: 'Deploy Site',
			'DEPLOY--github': 'Deploy to Github Repo',
			'DEPLOY--gitlab': 'Deploy to Gitlab Repo',
			'AUTHENTICATE--github': 'Authenticate GitHub Account',
			'AUTHENTICATE--gitlab': 'Authenticate GitLab Account',
			ACTIVE: 'Deploy to Repo'
		}

		const proxy = new Proxy(titles, {
			get(target, prop, receiver) {
				const [key, title] = Object.entries(target).find(([key]) => prop.startsWith(key))
				return title
			}
		})

		return proxy[stage]
	}

	let loading = false
</script>

<div class="Deploy primo-reset">
	<header>
		<h2>
			<Icon icon="ic:sharp-publish" />
			<span>{Title(stage)}</span>
		</h2>
		<button on:click={() => modal.hide()}>
			<Icon icon="ic:baseline-close" />
		</button>
	</header>
	{#if stage === 'INITIAL'}
		<div class="container">
			<p class="description">
				To publish your website, you'll need to upload it to a web host. You can either <a
					href="https://docs.primocms.org/publishing"
				>
					manually upload
				</a>
				your site, or
				<a href="https://docs.primocms.org/publishing">deploy it from a Github repo.</a>
			</p>
			<div class="buttons">
				<button class="primo-button" on:click={download_site}>
					<Icon icon={loading ? 'eos-icons:loading' : 'ic:baseline-download'} />
					<span>Download</span>
				</button>

				{#if !fetched_git_account}
					<Icon icon="line-md:loading-twotone-loop" />
				{:else if !github_account && !gitlab_account}
					<DropdownButton
						primary_button={{
							icon: 'mdi:github',
							label: 'Connect Github',
							onclick: () => (stage = 'AUTHENTICATE--github')
						}}
						buttons={[
							{
								icon: 'mdi:gitlab',
								label: 'Connect Gitlab',
								onclick: () => (stage = 'AUTHENTICATE--gitlab')
							}
						]}
					/>
				{:else if github_account && !gitlab_account}
					<DropdownButton
						primary_button={{
							icon: 'mdi:github',
							label: 'Deploy to Github',
							onclick: () => (stage = 'DEPLOY--github')
						}}
						buttons={[
							{
								icon: 'mdi:gitlab',
								label: 'Connect Gitlab',
								onclick: () => (stage = 'DEPLOY--gitlab')
							}
						]}
					/>
				{:else if !github_account && gitlab_account}
					<DropdownButton
						primary_button={{
							icon: 'mdi:gitlab',
							label: 'Deploy to Gitlab',
							onclick: () => (stage = 'DEPLOY--gitlab')
						}}
						buttons={[
							{
								icon: 'mdi:github',
								label: 'Connect Github',
								onclick: () => (stage = 'AUTHENTICATE--github')
							}
						]}
					/>
				{:else if github_account && gitlab_account}
					<DropdownButton
						primary_button={{
							icon: 'mdi:github',
							label: 'Deploy to Github',
							onclick: () => (stage = 'DEPLOY--github')
						}}
						buttons={[
							{
								icon: 'mdi:gitlab',
								label: 'Deploy to Gitlab',
								onclick: () => (stage = 'DEPLOY--gitlab')
							}
						]}
					/>
				{/if}
			</div>
		</div>
	{:else if stage.startsWith('AUTHENTICATE')}
		{@const provider = stage.split('--')[1]}
		<div class="container">
			<p>
				Enter your <span style="text-decoration: capitalize">{provider}</span>
				API token to deploy sites to your account. See the
				<a target="blank" href="https://docs.primocms.org/publishing">docs</a>
				for more details.
			</p>
			<div>
				<div style="display: flex; justify-content: space-between">
					<p>Enter API Token</p>
					<button class="primo-link" on:click={() => (stage = 'INITIAL')}>change provider</button>
				</div>
				<form on:submit|preventDefault={(e) => connect_git(e, provider)}>
					<div>
						<TextInput placeholder="Token" />
						<button class="primo-button">Connect</button>
					</div>
				</form>
			</div>
		</div>
	{:else if stage.startsWith('DEPLOY')}
		{@const provider = stage.split('--')[1]}
		{@const provider_user = {
			github: {
				avatar: github_account?.avatar_url,
				username: github_account?.login
			},
			gitlab: {
				avatar: gitlab_account?.avatar_url,
				username: gitlab_account?.username
			}
		}[provider]}
		<div class="container">
			<div class="account-card">
				<div class="user">
					<img src={provider_user?.avatar} alt="{provider} avatar" />
					<span>{provider_user?.username}</span>
				</div>
				<button class="primo-link" on:click={() => (stage = `AUTHENTICATE--${provider}`)}>
					change
				</button>
			</div>
			{#if stage === `DEPLOY--${provider}`}
				<div class="buttons">
					<!-- <button class="primo-button" on:click={download_site}>
						<Icon icon="ic:baseline-download" />
					</button> -->
					<button class="primo-button" on:click={() => (stage = stage += '--USE_EXISTING')}>
						Use existing repo
					</button>
					<button class="primo-button primary" on:click={() => (stage = stage += '--CREATE_REPO')}>
						Create new repo
					</button>
				</div>
			{:else if stage.includes('USE_EXISTING')}
				<div class="create-repo">
					<header>
						<h3>Deploy to existing repo</h3>
						<button on:click={() => (stage = `DEPLOY--${provider}--CREATE_REPO`)}>
							create new repo instead
						</button>
					</header>
					<form
						on:submit|preventDefault={({ target }) => {
							deploy_to_repo({
								name: target[0]['value'],
								provider
							})
						}}
					>
						<p class="form-label">Select repo</p>
						<div>
							{#await get_repos(provider)}
								<Spinner />
							{:then repos}
								<Select options={repos} />
							{/await}
							<PrimaryButton type="submit" label="Deploy" {loading} />
						</div>
					</form>
					<footer>On deployment, your site will overwrite the contents of the repo</footer>
				</div>
			{:else if stage.includes('CREATE_REPO')}
				<div class="create-repo">
					<header>
						<h3>Create new repo</h3>
						<button on:click={() => (stage = `DEPLOY--${provider}--USE_EXISTING`)}>
							use existing repo instead
						</button>
					</header>
					<form
						on:submit|preventDefault={({ target }) => {
							deploy_to_repo({
								name: `${provider_user.username}/${target[0]['value']}`,
								create_repo: true,
								provider
							})
						}}
					>
						<p class="form-label">Enter repo name</p>
						<div>
							<TextInput placeholder="Site" />
							<button class="primo-button primary" disabled={loading}>
								{#if loading}
									<Icon icon="eos-icons:loading" />
								{:else}
									<span>Deploy</span>
								{/if}
							</button>
						</div>
					</form>
					<footer>This repo will be created in your account</footer>
				</div>
			{/if}
		</div>
	{:else if stage.startsWith('ACTIVE')}
		{@const provider = $active_deployment.repo.html_url ? 'github' : 'gitlab'}
		<!-- temporary, set provider in active deployment later -->
		<div class="repo-card">
			<div>
				<a
					class="name"
					href={$active_deployment.repo.html_url || $active_deployment.repo.web_url}
					target="_blank"
				>
					{$active_deployment.repo.full_name}
				</a>
				<span class="last-updated">
					{format($active_deployment.created)}
				</span>
			</div>
			<button class="primo-link" on:click={() => (stage = `DEPLOY--${provider}`)}>edit</button>
		</div>
		{#if stage !== 'ACTIVE__DEPLOYED'}
			<div class="buttons">
				<PrimaryButton
					label="Deploy"
					{loading}
					on:click={() =>
						deploy_to_repo({
							name: $active_deployment.repo.full_name,
							provider
						})}
				/>
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
	.Deploy.primo-reset {
		background: var(--primo-color-black);
		padding: 1.125rem 1.25rem;
		display: grid;
		gap: 1rem;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		h2 {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-weight: 500;
		}
	}
	.container {
		display: grid;
		gap: 1rem;

		a {
			text-decoration: underline;
		}
	}
	.account-card {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0.5rem;
		border-radius: 0.25rem;
		border: 0.8px solid #6e6e6e;

		.user {
			font-weight: 400;
			font-size: 0.75rem;
			line-height: 1.125rem;
			color: #cecece;
			display: flex;
			align-items: center;
			gap: 0.5rem;

			img {
				width: 2rem;
				aspect-ratio: 1 / 1;
				border-radius: 50%;
			}
		}
	}

	.description {
		a {
			text-decoration: underline;
		}
	}

	.primo-link {
		text-align: left;
		font-size: 0.875rem;
		color: var(--color-gray-3);
		text-decoration: underline;
	}

	.create-repo {
		header {
			display: flex;
			align-items: center;
			button {
				font-size: 0.75rem;
				color: #9d9d9d;
				text-decoration: underline;
			}
		}
		.form-label {
			font-size: 12px;
			color: #b6b6b6;
			margin-bottom: 0.125rem;
		}
		footer {
			font-size: 0.625rem;
			color: #858585;
			margin-top: 0.25rem;
		}
	}

	.repo-card {
		display: flex;

		div {
			flex: 1;
			display: grid;
			justify-content: flex-start;
		}

		.name {
			text-decoration: underline;
		}

		.last-updated {
			font-size: 0.75rem;
			color: #b6b6b6;
		}
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}
	.primo-button {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 7px 16px;
		background: #1f1f1f;
		border-radius: 0.25rem;
		height: 100%;
	}
	.primo-button.primary {
		border: 1px solid #35d994;
		background: transparent;
	}
	form {
		margin-top: 0.5rem;

		div {
			display: grid;
			gap: 0.5rem;
			grid-template-columns: 1fr auto;
			gap: 0.5rem;
		}
	}
	:global(form > label) {
		flex: 1;
	}
</style>
