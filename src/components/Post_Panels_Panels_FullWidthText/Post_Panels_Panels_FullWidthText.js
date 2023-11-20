import styles from './Post_Panels_Panels_FullWidthText.module.scss';

const Post_Panels_Panels_FullWidthText = ({ children, panel }) => {
  return (
    <>
      <div className={styles.Post_Panels_Panels_FullWidthText}>{JSON.stringify(children)}</div>
      <h2>{panel.title}</h2>
      <h3>{panel.subtitle}</h3>
      <p>{panel.content}</p>
      <p>{panel.ctaButtonText}</p>
      <p>{panel.ctaButtonLink}</p>
    </>
  );
};

export default Post_Panels_Panels_FullWidthText;
