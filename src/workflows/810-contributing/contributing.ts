import spaceTrim from 'spacetrim';
import { IWorkflowOptions } from '../IWorkflow';

const CONTRIBUTING_IN_MARKDOWN = /<!--Contributing-->(?<badges>.*)<!--\/Contributing-->/is;

export async function contributing({
    projectTitle,
    projectName,
    projectPath,
    projectOrg,
    modifyFiles,
    commit,
    branch,
}: IWorkflowOptions): Promise<void> {
    const contributingMarkdown = spaceTrim(`

      <!--Contributing-->

      ## 🖋️ Contributing

      I am open to pull requests, feedback, and suggestions. Or if you like this utility, you can [☕ buy me a coffee](https://www.buymeacoffee.com/hejny) or [donate via cryptocurrencies](https://github.com/hejny/hejny/blob/main/documents/crypto.md).

      <!--/Contributing-->

`);

    await modifyFiles('README.md', async (readmeContent) => {
        if (CONTRIBUTING_IN_MARKDOWN.test(readmeContent)) {
            return readmeContent.replace(CONTRIBUTING_IN_MARKDOWN, contributingMarkdown);
        } else {
            return spaceTrim(
                (block) => `

                  ${block(readmeContent)}


                  ${block(contributingMarkdown)}

            `,
            );
        }
    });

    await commit('🖋️ Update contributing');
}
