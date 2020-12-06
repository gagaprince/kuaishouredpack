import ClassManager from '@modules/ClassManager/index';


export const openLiveSquareActivity = async ()=>{
    const Intent = Java.use('android.content.Intent');
    const Uri = Java.use('android.net.Uri');
    const classManager = ClassManager.getInstance();
    const homeActivity = await classManager.findInstanceForJavaClass('com.yxcorp.gifshow.HomeActivity');
    return new Promise((res,rej)=>{
        Java.perform(()=>{
            try{
                const url = 'kwai://liveaggregatesquare?scene=2&sourceType=77&pageType=32167';
                const uri = Uri.parse(url);
                homeActivity.startActivity(Intent.$new("android.intent.action.VIEW",uri));
            }catch(e){rej(e)}
            res(true);
        });
    });
    
    
}