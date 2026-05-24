import { AsyncResult, Atom } from 'effect/unstable/reactivity';
import { Effect } from 'effect';
import { atomRuntime } from '../../../app/boot';
import { createGlossaryTerm, listGlossaryTerms, updateGlossaryTerm } from '../../../usecase/glossary-terms';
import type { GlossaryTerm, InsertGlossaryTerm } from '../../../db/schema';

export type EditableGlossaryTerm = InsertGlossaryTerm & { id: string };

export interface GlossaryEntry {
	id: string;
	char: string;
	pinyin: string;
	category: string;
	frPrimary: string;
	fr: string[];
	refs?: Record<string, string>;
	note: string;
}

export interface Category {
	id: string;
	label: string;
	color: string;
}

export const categoriesAtom = Atom.make<Category[]>([
	{ id: 'concept', label: 'Concept', color: 'blue' },
	{ id: 'meridian', label: 'Méridien', color: 'teal' },
	{ id: 'point', label: 'Point', color: 'grape' },
	{ id: 'pathology', label: 'Pathologie', color: 'red' },
	{ id: 'technique', label: 'Technique', color: 'yellow' },
	{ id: 'herb', label: 'Plante', color: 'gray' },
	{ id: 'proper', label: 'Nom propre', color: 'gray' },
]);

const toGlossaryEntry = (term: GlossaryTerm): GlossaryEntry => ({
	id: term.id,
	char: term.char,
	pinyin: term.pinyin,
	category: term.category,
	frPrimary: term.frPrimary,
	fr: term.fr,
	refs: term.refs ?? undefined,
	note: term.note ?? '',
});

export const glossaryAsyncAtom = atomRuntime.atom(
	listGlossaryTerms.pipe(Effect.map((terms) => terms.map(toGlossaryEntry))),
).pipe(Atom.withReactivity(['glossary-terms']));

const toNewGlossaryTerm = (term: EditableGlossaryTerm) => ({
	id: term.id,
	char: term.char,
	pinyin: term.pinyin,
	category: term.category,
	fr: term.fr ?? [],
	frPrimary: term.frPrimary,
	refs: term.refs ?? undefined,
	note: term.note ?? '',
});

const toUpdateGlossaryPatch = (term: EditableGlossaryTerm) => ({
	char: term.char,
	pinyin: term.pinyin,
	category: term.category,
	fr: term.fr ?? [],
	frPrimary: term.frPrimary,
	refs: term.refs ?? undefined,
	note: term.note ?? '',
});

export const createGlossaryTermAtom = atomRuntime.fn<EditableGlossaryTerm>()(
	Effect.fn(function* (term) {
		yield* createGlossaryTerm(toNewGlossaryTerm(term));
	}),
	{ reactivityKeys: ['glossary-terms'] },
);

export const updateGlossaryTermAtom = atomRuntime.fn<EditableGlossaryTerm>()(
	Effect.fn(function* (term) {
		yield* updateGlossaryTerm(term.id, toUpdateGlossaryPatch(term));
	}),
	{ reactivityKeys: ['glossary-terms'] },
);

export const glossaryAtom = Atom.readable((get): GlossaryEntry[] => {
	const result = get(glossaryAsyncAtom);
	return AsyncResult.isSuccess(result) ? result.value : [];
});

export const glossaryLoadErrorAtom = Atom.readable((get): string | null => {
	const result = get(glossaryAsyncAtom);
	return AsyncResult.isFailure(result) ? String(result.cause) : null;
});

export const queryAtom = Atom.make('');
export const categoryAtom = Atom.make('all');
export const editingAtom = Atom.make<EditableGlossaryTerm | null>(null);

export const categoryColorMapAtom = Atom.readable((get) =>
	Object.fromEntries(get(categoriesAtom).map((category) => [category.id, category.color])),
);

export const categoryBadgeClassMapAtom = Atom.readable((get) =>
	Object.fromEntries(get(categoriesAtom).map((category) => [category.id, `badge-${category.color}`])),
);

export const categoryCountsAtom = Atom.readable((get) => {
	const counts: Record<string, number> = {};
	for (const term of get(glossaryAtom)) {
		counts[term.category] = (counts[term.category] ?? 0) + 1;
	}
	return counts;
});

export const filteredGlossaryAtom = Atom.readable((get) => {
	const query = get(queryAtom);
	const selectedCategory = get(categoryAtom);
	const glossary = get(glossaryAtom);

	return glossary.filter((term) => {
		if (selectedCategory !== 'all' && term.category !== selectedCategory) {
			return false;
		}

		if (!query) {
			return true;
		}

		const lowerQuery = query.toLowerCase();
		return (
			term.char.includes(query) ||
			term.pinyin.toLowerCase().includes(lowerQuery) ||
			term.fr.some((translation) => translation.toLowerCase().includes(lowerQuery))
		);
	});
});

export const occurrencesByIdAtom = Atom.readable((get) => {
	const map: Record<string, number> = {};
	for (const term of get(glossaryAtom)) {
		let hash = 0;
		for (const char of term.id) {
			hash += char.charCodeAt(0);
		}
		map[term.id] = (hash % 30) + 1;
	}
	return map;
});
