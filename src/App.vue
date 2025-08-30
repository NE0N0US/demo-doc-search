<template>
	<div class="root min-height-screen row">
		<div class="layout grow column">
			<header class="row">
				<h1>Тестовое задание</h1>
				<span>Neonous</span>
			</header>
			<main class="grow">
				<section class="search column">
					<h3>Поиск документа</h3>
					<input placeholder="Введите ID документа" v-model="query" @input="search"/>
					<h3>Результаты</h3>
					<span v-if="loading">Загрузка…</span>
					<span v-else-if="error">Ошибка! {{error}}</span>
					<template v-else>
						<span v-if="!docs.length">Ничего не найдено</span>
						<div class="results column">
							<button class="result row" v-for="doc in docs" :key="doc.id"
							:class="{selected: selection?.id === doc.id}" @click="docsStore.select(doc)">
								<img draggable="false" :src="doc.image ?? 'default-doc.png'" @error.once="doc.image = null"/>
								<div class="grow column">
									<span>{{doc.name}}</span>
									<span>{{(doc.description.length / 1_000).toFixed(1)}} KB</span>
								</div>
							</button>
						</div>
					</template>
				</section>
				<section class="preview row">
					<div v-if="!selection" class="preview-placeholder grow row">
						<span>Выберите документ, чтобы посмотреть его содержимое</span>
					</div>
					<template v-else>
						<div :class="{'preview-no-image': !selection.image}">
							<h3>{{selection.name}}</h3>
							<button @click="download(selection.description, selection.name)">Скачать</button>
							<button class="preview-delete" :disabled="!selection.image"
							@click="docsStore.remove(selection.id)">Удалить</button>
							<h3>Описание</h3>
							<p>{{selection.description}}</p>
						</div>
						<img draggable="false" v-if="selection.image" :src="selection.image ?? 'default-doc.png'"/>
					</template>
				</section>
			</main>
		</div>
	</div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {storeToRefs} from 'pinia'
import {useDocsStore} from './stores/docs'

const
	docsStore = useDocsStore(),

	{loading, error, docs, selection} = storeToRefs(docsStore),

	query = ref('')

let debounceTimer: number

function search(){
	clearTimeout(debounceTimer)
	debounceTimer = setTimeout(() => docsStore.fetch(query.value), 250)
}

function download(text: string, filename: string, type = 'text/plain'){
	const url = URL.createObjectURL(new Blob([text], {type}))
	Object.assign(document.createElement('a'), {download: filename, href: url, type}).click()
	setTimeout(() => URL.revokeObjectURL(url))
}

onMounted(() => docsStore.fetch('', 0))
</script>

<style scoped>
.root{
	--l-sm: 0.5rem;
	--l-md: 1rem;
	--l-lg: 1.5rem;
	--shadow-sm: 0 0 var(--l-sm) lightgray;
	--c-border: lightgray;
	--c-primary: dodgerblue;
	--c-on-primary: white;
	justify-content: center;
}

@media(prefers-color-scheme: dark){
	.root{
		--shadow-sm: 0 0 0 1px lightgray;
	}
}

.layout{
	margin: var(--l-md) var(--l-lg);
	max-width: 1200px;
	font-family: 'Montserrat', sans-serif;
}

header {
	justify-content: space-between;
	align-items: baseline;
}

h1, h3{
	margin: 0;
}

h1{
	margin-bottom: var(--l-md);
}

h3{
	margin-bottom: var(--l-sm);
}

main {
	box-shadow: var(--shadow-sm);
	border-radius: var(--l-sm);
	overflow: hidden;
	display: grid;
	grid-template-columns: 300px 1fr;
}

.search, .preview {
	padding: var(--l-lg);
}

.search, .result>img{
	border: solid var(--c-border);
	border-width: 0 1px 0 0;
}

.results, .preview{
	overflow: auto;
}

.search{
	overflow: hidden;
}

@media(max-width: 600px){
	main {
		grid-template-columns: none;
		grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
	}

	.search{
		border-width: 0 0 1px 0;
	}
}

.search>input{
	border-radius: var(--l-sm);
	border: 1px solid var(--c-border);
	padding: var(--l-md) var(--l-lg);
	font-size: 1rem;
	margin-bottom: var(--l-md);
}

.results{
	margin: 0 calc(-1 * var(--l-sm));
	padding: var(--l-sm);
	gap: var(--l-md);
}

.result{
	appearance: none;
	border: none;
	background: none;
	padding: 0;
	font: inherit;
	text-align: inherit;
	box-shadow: var(--shadow-sm);
}

.result>img{
	padding: var(--l-sm);
	width: 64px;
	height: 64px;
	object-fit: contain;
}

.result>div{
	padding: var(--l-md);
	gap: var(--l-sm);
	justify-content: center;
	overflow-wrap: anywhere;
}

.result.selected>div, .result:hover>div{
	background: var(--c-primary);
	color: var(--c-on-primary);
}

.result>div>span:last-child{
	opacity: 0.8;
}

.preview{
	display: grid;
	grid-template-columns: minmax(120px, auto) minmax(auto, 300px);
	gap: var(--l-md);
}

.preview-placeholder, .preview-no-image{
	grid-column: span 2;
}

.preview-placeholder{
	min-height: 100%;
	justify-content: center;
	align-items: center;
}

.preview button{
	--c-button: var(--c-primary);
	border-radius: var(--l-sm);
	border: 1px solid var(--c-button);
	background: transparent;
	padding: var(--l-md) var(--l-lg);
	color: var(--c-button);
	font-size: 1rem;
	margin-right: var(--l-sm);
	margin-bottom: var(--l-md);
}

.preview button.preview-delete{
	--c-button: red;
}

.preview button:disabled{
	--c-button: gray;
}

.preview>img{
	order: -1;
	max-width: 100%;
	object-fit: contain;
}

@media(max-width: 800px){
	.preview{
		grid-template-columns: none;
	}

	.preview>img{
		order: 0;
	}
}
</style>
