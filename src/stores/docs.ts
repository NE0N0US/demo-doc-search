import {ref} from 'vue'
import {defineStore} from 'pinia'
import type {DocumentType} from '../types/types'

export const useDocsStore = defineStore('documents', () => {
	const
		loading = ref(false),

		error = ref<string | null>(null),

		docs = ref<DocumentType[]>([]),

		selection = ref<DocumentType | null>(null)

	return {
		loading, error, docs, selection,

		async fetch(query: string, throttle = 250){
			const throttlePromise = new Promise(resolve => setTimeout(resolve, throttle))
			loading.value = true
			error.value = null
			try{
				const response = await fetch(`${import.meta.env.VITE_API_URL}/user/docs?` + new URLSearchParams({search: query}))
				docs.value = await response.json()
				this.select(selection.value ? docs.value.find(({id}) =>
					id === selection.value?.id
				) ?? null : null)
			}
			catch(err){
				console.error(err)
				error.value = err?.toString() ?? 'Неизвестная ошибка'
			}
			finally{
				await throttlePromise
				loading.value = false
			}
		},

		select(doc: DocumentType | null){
			selection.value = doc
		},

		remove(id: number){
			docs.value = docs.value.filter(doc => doc.id !== id)
			if(selection.value?.id === id)
				selection.value = null
		}
	}
})
