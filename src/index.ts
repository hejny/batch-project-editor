import Git from 'nodegit';
import path from 'path';


main();

async function main(){

    const repository = await Git.Repository.open(path.join(process.cwd(),'../../townsgame/Towns2'/* TODO: Take from cli args */))
    
    const masterCommit = await repository.getMasterCommit();


    console.log(masterCommit.committer().toString());

}