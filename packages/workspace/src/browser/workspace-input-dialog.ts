/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
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

import { inject, injectable } from 'inversify';
import URI from '@theia/core/lib/common/uri';
import { SingleTextInputDialog, SingleTextInputDialogProps, LabelProvider } from '@theia/core/lib/browser';
import { WorkspaceService } from './workspace-service';

@injectable()
export class WorkspaceInputDialogProps extends SingleTextInputDialogProps {
    /**
     * The parent `URI` for the selection present in the explorer.
     * Used to display the path in which the file/folder is created at.
     */
    parentUri: URI;
}

export class WorkspaceInputDialog extends SingleTextInputDialog {

    constructor(
        @inject(WorkspaceInputDialogProps) protected readonly props: WorkspaceInputDialogProps,
        @inject(LabelProvider) protected readonly labelProvider: LabelProvider,
        @inject(WorkspaceService) protected readonly workspaceService?: WorkspaceService
    ) {
        super(props);
        this.appendParentPath();
    }

    /**
     * Append the human-readable parent `path` to the dialog.
     * When possible, display the relative path, else display the full path (ex: workspace root).
     */
    protected appendParentPath(): void {
        // Compute the label for the parent URI.
        let label = this.labelProvider.getLongName(this.props.parentUri);
        const element = document.createElement('div');
        element.classList.add('theia-dialog-node-content');
        // Create the `folder` icon.
        const icon = document.createElement('i');
        icon.classList.add('codicon', 'codicon-folder', 'theia-dialog-icon');
        if (this.workspaceService && this.workspaceService.isMultiRootWorkspaceOpened) {
            const rootUri = this.workspaceService.getWorkspaceRootUri(this.props.parentUri);
            if (rootUri) {
                element.title = this.labelProvider.getLongName(rootUri);
                if (this.props.parentUri.isEqualOrParent(rootUri)) {
                    icon.classList.replace('codicon-folder', 'codicon-root-folder');
                    label = this.labelProvider.getName(this.props.parentUri);
                }
            }
        }
        // Add the path and icon div before the `inputField`.
        element.appendChild(icon);
        element.appendChild(document.createTextNode(label));
        this.contentNode.insertBefore(element, this.inputField);
    }
}

