import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('published declarations preserve nested values and absent optional parents', () => {
    const output = mkdtempSync(join(tmpdir(), 'continu-types-'));
    const options: ts.CompilerOptions = {
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.Node10,
        strict: true,
        skipLibCheck: true,
        types: [],
    };
    const messages = (diagnostics: readonly ts.Diagnostic[]) => diagnostics.map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n'));

    try {
        const declarations = ts.createProgram([resolve('src/index.ts')], {
            ...options,
            declaration: true,
            emitDeclarationOnly: true,
            rootDir: resolve('src'),
            outDir: output,
        });

        expect(messages(ts.getPreEmitDiagnostics(declarations))).toEqual([]);
        declarations.emit();
        const consumer = join(output, 'consumer.ts');

        writeFileSync(consumer, readFileSync('test/types/optional-paths.ts', 'utf8').replaceAll("'continu'", "'./index'"));
        const program = ts.createProgram([consumer], { ...options, noEmit: true });

        expect(messages(ts.getPreEmitDiagnostics(program))).toEqual([]);
    } finally {
        rmSync(output, { recursive: true, force: true });
    }
});
