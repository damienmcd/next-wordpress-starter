import styles from './Post_Panels_Panels_PageHeader.module.scss';

const Post_Panels_Panels_PageHeader = ({ children, panel }) => {
  return (
    <>
      <div className={styles.Post_Panels_Panels_PageHeader}>{JSON.stringify(children)}</div>
      <h2>{panel.title}</h2>
      <h3>{panel.subtitle}</h3>
      <p>{panel.content}</p>
    </>
  );
};

export default Post_Panels_Panels_PageHeader;
