import styles from './Post_Panels_Panels_PageHeader.module.scss';

const Post_Panels_Panels_PageHeader = ({ children, title, subtitle, content }) => {
  return (
    <>
      <div className={styles.Post_Panels_Panels_PageHeader}>{JSON.stringify(children)}</div>
      <h2>{title}</h2>
      <h3>{subtitle}</h3>
      <p>{content}</p>
    </>
  );
};

export default Post_Panels_Panels_PageHeader;
