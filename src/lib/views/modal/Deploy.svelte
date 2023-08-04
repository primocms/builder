<script context="module">
	import { browser } from '$app/environment'
	import { writable } from 'svelte/store'
	import axios from 'axios'

	const github_account = writable(null)

	let JSZip, saveFile
	import('jszip').then((module) => (JSZip = module.default))
	import('file-saver').then((module) => (saveFile = module.saveAs))
</script>

<script>
	import Icon from '@iconify/svelte'
	import _ from 'lodash-es'
	import { format } from 'timeago.js'
	import TextInput from '$lib/ui/TextInput.svelte'
	import Select from '$lib/ui/inputs/Select.svelte'
	import modal from '$lib/stores/app/modal'
	import site, { active_deployment } from '$lib/stores/data/site'
	import pages from '$lib/stores/data/pages'
	import { push_site, buildSiteBundle } from './Deploy'
	import PrimaryButton from '$lib/ui/PrimaryButton.svelte'
	import { dataChanged } from '$lib/database'

	let stage = 'INITIAL'

	if ($active_deployment) {
		stage = 'CONNECT_REPO__ACTIVE'
	}

	let entered_github_token = ''

	$: if (!$github_account) {
		axios
			.get('/api/deploy/user')
			.then(({ data }) => ($github_account = data))
			.catch((e) => console.log(e))
	}

	async function connect_github() {
		const headers = { Authorization: `Bearer ${entered_github_token}` }

		const { data } = await axios.get(`https://api.github.com/user`, {
			headers: { ...headers, Accept: 'application/vnd.github.v3+json' }
		})

		if (data) {
			$github_account = data
			stage = 'CONNECT_REPO'
			await dataChanged({
				table: 'config',
				action: 'update',
				id: 'github_token',
				data: { value: entered_github_token, options: { user: data } }
			})
		}
	}

	let files = []
	async function build_files() {
		const all_files = await buildSiteBundle({ pages: $pages })
		files = _.uniqBy(
			all_files.map((file) => {
				return {
					...file,
					file: file.path,
					data: file.content
				}
			}),
			'file'
		) // remove duplicated modules
	}

	async function download_site() {
		loading = true
		await build_files()
		const toDownload = await create_site_zip()
		saveFile(toDownload, `${$site.name}.zip`)
		modal.hide()

		async function create_site_zip() {
			const zip = new JSZip()
			files.forEach(({ file, data }) => {
				zip.file(file, data)
			})
			return await zip.generateAsync({ type: 'blob' })
		}
	}

	$: console.log({ $active_deployment })

	let new_repo_name = ''
	let existing_repo_name = ''
	async function deploy_to_repo() {
		loading = true
		const deployment = await push_site({
			repo_name: new_repo_name || existing_repo_name || $active_deployment.repo.full_name,
			create_new: new_repo_name ? true : false
		})
		if (deployment) {
			$active_deployment = deployment
			stage = 'CONNECT_REPO__ACTIVE__SUCCESS'
		} else {
			alert('Could not deploy to repo')
		}
		loading = false
	}

	async function get_repos() {
		const { data } = await axios.get('/api/deploy/repos')
		return data
	}

	const Title = (stage) => {
		const titles = {
			INITIAL: 'Deploy Site',
			CONNECT_GITHUB: 'Connect to Github',
			CONNECT_REPO: 'Deploy to Repository'
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
				{#if $github_account}
					<button class="primo-button primary" on:click={() => (stage = 'CONNECT_REPO')}>
						<Icon icon="mdi:github" />
						<span>Deploy to Github</span>
					</button>
				{:else}
					<button class="primo-button primary" on:click={() => (stage = 'CONNECT_GITHUB')}>
						<Icon icon="mdi:github" />
						<span>Connect to Github</span>
					</button>
				{/if}
			</div>
		</div>
	{:else if stage === 'CONNECT_GITHUB'}
		<div class="container">
			<p>
				Enter your Github token to deploy sites to your account. See the <a
					target="blank"
					href="https://docs.primocms.org/publishing"
				>
					docs
				</a>
				for more details.
			</p>
			<div>
				<p>Enter API Token</p>
				<form on:submit|preventDefault={connect_github}>
					<div>
						<TextInput bind:value={entered_github_token} placeholder="Token" />
						<button class="primo-button">Connect</button>
					</div>
				</form>
			</div>
		</div>
	{:else if stage.startsWith('CONNECT_REPO')}
		<div class="container">
			<div class="account-card">
				<div class="user">
					<img src={$github_account.avatar_url} alt="Github avatar" />
					<span>{$github_account.login}</span>
				</div>
				<button
					class="primo-link"
					on:click={() => {
						stage = 'CONNECT_GITHUB'
					}}
				>
					edit
				</button>
			</div>
			{#if stage === 'CONNECT_REPO'}
				<div class="buttons">
					<button class="primo-button" on:click={() => (stage = 'CONNECT_REPO__USE_EXISTING')}>
						Use existing repo
					</button>
					<button
						class="primo-button primary"
						on:click={() => (stage = 'CONNECT_REPO__CREATE_REPO')}
					>
						Create new repo
					</button>
				</div>
			{:else if stage === 'CONNECT_REPO__CREATE_REPO'}
				<div class="create-repo">
					<header>
						<h3>Create new repo</h3>
						<button on:click={() => (stage = 'CONNECT_REPO__USE_EXISTING')}>
							use existing repo instead
						</button>
					</header>
					<form on:submit|preventDefault={deploy_to_repo}>
						<p class="form-label">Enter repo name</p>
						<div>
							<TextInput bind:value={new_repo_name} placeholder="Site" />
							<button class="primo-button primary" disabled={loading}>
								{#if loading}
									<Icon icon="eos-icons:loading" />
								{:else}
									<span>Deploy</span>
								{/if}
							</button>
						</div>
					</form>
					<footer>after deploying this repo will be created in your Github account.</footer>
				</div>
			{:else if stage === 'CONNECT_REPO__USE_EXISTING'}
				<div class="create-repo">
					<header>
						<h3>Connect to existing repo</h3>
						<button on:click={() => (stage = 'CONNECT_REPO__CREATE_REPO')}>
							create new repo instead
						</button>
					</header>
					<form on:submit|preventDefault={deploy_to_repo}>
						<p class="form-label">Select repo</p>
						<div>
							{#await get_repos()}
								<Select options={[]} />
							{:then repos}
								<Select bind:value={existing_repo_name} options={repos} />
							{/await}
							<PrimaryButton type="submit" label="Deploy" {loading} />
						</div>
					</form>
					<footer>after deploying this repo will be created in your Github account.</footer>
				</div>
			{:else if stage.startsWith('CONNECT_REPO__ACTIVE')}
				<div class="repo-card">
					<div>
						<a class="name" href={$active_deployment.repo.html_url} target="_blank">
							{$active_deployment.repo.full_name}
						</a>
						<span class="last-updated">
							{format($active_deployment.created)}
						</span>
					</div>
					<button class="primo-link" on:click={() => (stage = 'CONNECT_REPO')}>edit</button>
				</div>
				{#if stage !== 'CONNECT_REPO__ACTIVE__SUCCESS'}
					<div class="buttons">
						<PrimaryButton label="Deploy" {loading} on:click={deploy_to_repo} />
					</div>
				{/if}
			{/if}
		</div>
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
