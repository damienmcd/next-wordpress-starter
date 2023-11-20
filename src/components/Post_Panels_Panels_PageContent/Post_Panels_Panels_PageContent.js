import styles from './Post_Panels_Panels_PageContent.module.scss';

const Post_Panels_Panels_PageContent = ({ children, panel }) => {
  return (
    <>
      <div className={styles.Post_Panels_Panels_PageContent}>{JSON.stringify(children)}</div>
      <div
        dangerouslySetInnerHTML={{
          __html: panel.body,
        }}
      />
    </>
  );
};

export default Post_Panels_Panels_PageContent;
