/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { ProblemMarker } from '../../common/problem-marker';
import { ProblemManager } from './problem-manager';
import { MarkerNode, MarkerTree, MarkerOptions, MarkerInfoNode } from '../marker-tree';
import { MarkerTreeModel } from '../marker-tree-model';
import { injectable, inject } from 'inversify';
import { OpenerOptions, TreeNode, CompositeTreeNode } from '@theia/core/lib/browser';
import { Marker } from '../../common/marker';
import { Diagnostic } from 'vscode-languageserver-types';
import { ProblemUtils } from './problem-utils';
const sortPaths = require('sort-paths');

@injectable()
export class ProblemTree extends MarkerTree<Diagnostic> {

    constructor(
        @inject(ProblemManager) protected readonly problemManager: ProblemManager,
        @inject(MarkerOptions) protected readonly markerOptions: MarkerOptions) {
        super(problemManager, markerOptions);
    }

    protected getMarkerNodes(parent: MarkerInfoNode, markers: Marker<Diagnostic>[]): MarkerNode[] {
        const nodes = super.getMarkerNodes(parent, markers);
        return nodes.sort((a, b) => this.sortMarkers(a, b));
    }

    /**
     * Sort markers based on the following rules:
     * - Markers are fist sorted by `severity`.
     * - Markers are sorted by `line number` if applicable.
     * - Markers are sorted by `column number` if
     * @param a the first marker for comparison.
     * @param b the second marker for comparison.
     */
    protected sortMarkers(a: MarkerNode, b: MarkerNode): number {
        const markerA = a.marker as Marker<Diagnostic>;
        const markerB = b.marker as Marker<Diagnostic>;

        // Determine the marker with the highest severity.
        const severity = ProblemUtils.severityCompare(markerA, markerB);
        if (severity !== 0) {
            return severity;
        }
        // Determine the marker with the lower line number.
        const lineNumber = ProblemUtils.lineNumberCompare(markerA, markerB);
        if (lineNumber !== 0) {
            return lineNumber;
        }
        // Determine the marker with the lower column number.
        const columnNumber = ProblemUtils.columnNumberCompare(markerA, markerB);
        if (columnNumber !== 0) {
            return columnNumber;
        }
        return 0;
    }

}

@injectable()
export class ProblemTreeModel extends MarkerTreeModel {

    sortChildNodes(): TreeNode[] {
        const children = (this.root as CompositeTreeNode).children;
        const sortedPath: string[] = sortPaths(children.map(child => child.id), '/') as Array<string>;
        return [...children].sort((a, b) => {
            if (sortedPath.indexOf(a.id) > sortedPath.indexOf(b.id)) {
                return 1;
            } else if (sortedPath.indexOf(a.id) < sortedPath.indexOf(b.id)) {
                return -1;
            }
            return 0;
        });
    }

    @inject(ProblemManager) protected readonly problemManager: ProblemManager;

    protected getOpenerOptionsByMarker(node: MarkerNode): OpenerOptions | undefined {
        if (ProblemMarker.is(node.marker)) {
            return {
                selection: node.marker.data.range
            };
        }
        return undefined;
    }

    removeNode(node: TreeNode): void {
        if (MarkerInfoNode.is(node)) {
            this.problemManager.cleanAllMarkers(node.uri);
        }
        if (MarkerNode.is(node)) {
            const { uri } = node;
            const { owner } = node.marker;
            const diagnostics = this.problemManager.findMarkers({ uri, owner, dataFilter: data => node.marker.data !== data }).map(({ data }) => data);
            this.problemManager.setMarkers(uri, owner, diagnostics);
        }
    }
}
