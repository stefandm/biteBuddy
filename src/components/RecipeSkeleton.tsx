import Skeleton from 'react-loading-skeleton'

interface RecipeSkeletonProps {
    cards: number;
  }

const RecipeSkeleton:React.FC<RecipeSkeletonProps>  = ({cards}) => {
  return (
    Array(cards).fill(0).map((_item,index) =>(
        <div key={index} className='flex flex-col  shadow-lg rounded-lg' >
        <Skeleton height={300} />
        <Skeleton height={40}/>
        </div>
    ))
   
  )
}

export default RecipeSkeleton
