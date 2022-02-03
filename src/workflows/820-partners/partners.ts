import spaceTrim from 'spacetrim';
import { IWorkflowOptions } from '../IWorkflow';
import { ORGANIZATIONS } from './organizations';

const PARTNERS_IN_MARKDOWN = /<!--Partners-->(?<badges>.*)<!--\/Partners-->/is;

export async function partners({
    projectTitle,
    projectName,
    projectPath,
    projectOrg,
    modifyFiles,
    commit,
    branch,
}: IWorkflowOptions): Promise<void> {
    const partnersMarkdown = spaceTrim(
        (block) => `

          <!--Partners-->

          ## ✨ Partners


          ${block(
              Object.values(ORGANIZATIONS)
                  .map(({ title, url, logoSrc }) =>
                      spaceTrim(`
                    <a href="${url.href}">
                      <img src="${logoSrc.href}" alt="${title} logo" width="50"  />
                    </a>
              `),
                  )
                  .join('\n&nbsp;&nbsp;&nbsp;\n'),
          )}


          [Become a partner](https://www.pavolhejny.com/contact/)

          <!--/Partners-->

`,
    );

    await modifyFiles('README.md', async (readmeContent) => {
        if (PARTNERS_IN_MARKDOWN.test(readmeContent)) {
            return readmeContent.replace(PARTNERS_IN_MARKDOWN, partnersMarkdown);
        } else {
            return spaceTrim(
                (block) => `

                  ${block(readmeContent)}


                  ${block(partnersMarkdown)}

            `,
            );
        }
    });

    await commit('✨ Update partners');
}
